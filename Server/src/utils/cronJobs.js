import cron from 'node-cron';
import ProblemReport from '../models/problemModel.js';
import { notifyAdmins } from './notificationUtils.js';

export const startCronJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running SLA & Urgency Score cron job...');
            const now = new Date();

            // 1. Check for expired SLAs
            const expiredIssues = await ProblemReport.find({
                status: { $in: ['pending', 'under_review', 'assigned'] },
                slaDueAt: { $lt: now },
                escalated: false
            });

            for (const issue of expiredIssues) {
                issue.escalated = true;
                issue.timeline.push({ type: 'status', message: 'Issue escalated due to missed SLA deadline' });
                await issue.save();

                await notifyAdmins({
                    type: 'status_update',
                    message: `ESCALATION: ${issue.priority} priority issue "${issue.title}" missed its SLA deadline!`,
                    problem: issue._id
                });
            }

            // 2. Recalculate Urgency Scores for all open issues
            const openIssues = await ProblemReport.find({
                status: { $in: ['pending', 'under_review', 'assigned'] }
            });

            for (const issue of openIssues) {
                const daysOpen = Math.floor((now - issue.createdAt) / (1000 * 60 * 60 * 24));
                const severityMultiplier = issue.priority === 'high' ? 5 : issue.priority === 'low' ? 1 : 3;
                
                // Formula: (Upvotes * 2) + Severity + Days Open
                const newScore = (issue.voteCount * 2) + severityMultiplier + daysOpen;
                
                if (issue.urgencyScore !== newScore) {
                    issue.urgencyScore = newScore;
                    await issue.save();
                }
            }
            
            console.log(`Cron completed. Escalated ${expiredIssues.length} issues, updated scores for ${openIssues.length} issues.`);
        } catch (error) {
            console.error('Error running SLA cron job:', error);
        }
    });
};
