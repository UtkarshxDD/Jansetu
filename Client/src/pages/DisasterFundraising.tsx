import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
    Heart, 
    Users, 
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus
} from 'lucide-react';
import CreateCampaignModal from '../components/CreateCampaignModal';

interface FundraisingCampaign {
    id: string;
    title: string;
    description: string;
    disasterType: 'flood' | 'earthquake' | 'fire' | 'cyclone' | 'drought' | 'landslide';
    location: string;
    coordinates: [number, number];
    targetAmount: number;
    raisedAmount: number;
    donorCount: number;
    daysLeft: number;
    createdBy: {
        name: string;
        organization?: string;
        verified: boolean;
    };
    images: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    category: 'medical' | 'shelter' | 'food' | 'education' | 'infrastructure' | 'emergency';
    createdAt: string;
    isActive: boolean;
    updates: CampaignUpdate[];
}

interface CampaignUpdate {
    id: string;
    title: string;
    description: string;
    images?: string[];
    createdAt: string;
}

// interface Donation {
//     id: string;
//     campaignId: string;
//     amount: number;
//     donorName: string;
//     isAnonymous: boolean;
//     message?: string;
//     createdAt: string;
// }

const DisasterFundraising: React.FC = () => {
    const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDisaster, setSelectedDisaster] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'urgent' | 'popular' | 'ending'>('urgent');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<FundraisingCampaign | null>(null);

    // Fetch campaigns from backend
    const fetchCampaigns = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/campaign/campaigns', {
                params: {
                    status: 'active',
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                    disasterType: selectedDisaster !== 'all' ? selectedDisaster : undefined,
                    sortBy: sortBy
                }
            });

            if (response.data.success) {
                // Transform backend data to match frontend interface
                const transformedCampaigns = response.data.campaigns.map((campaign: any) => ({
                    id: campaign._id,
                    title: campaign.title,
                    description: campaign.shortDescription || campaign.description,
                    disasterType: campaign.disasterType,
                    location: `${campaign.location.city}, ${campaign.location.state}`,
                    coordinates: campaign.location.coordinates.coordinates,
                    targetAmount: campaign.targetAmount,
                    raisedAmount: campaign.raisedAmount,
                    donorCount: campaign.donorCount,
                    daysLeft: Math.max(0, Math.ceil((new Date(campaign.campaignDuration.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
                    createdBy: {
                        name: campaign.organizationName || campaign.createdBy.name,
                        organization: campaign.organizationType,
                        verified: campaign.isVerified
                    },
                    images: campaign.images || [],
                    urgencyLevel: campaign.urgencyLevel,
                    category: campaign.category,
                    createdAt: campaign.createdAt,
                    isActive: campaign.status === 'active',
                    updates: campaign.updates || []
                }));
                setCampaigns(transformedCampaigns);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            // Fallback to mock data for demo
            loadMockData();
        }
    };

    const loadMockData = () => {
        const mockCampaigns: FundraisingCampaign[] = [
            {
                id: 'camp-1',
                title: 'Emergency Relief for Flood Victims in Kerala',
                description: 'Devastating floods have affected over 10,000 families in Kerala. We need immediate funds for food, shelter, and medical supplies. Every donation counts in saving lives and rebuilding communities.',
                disasterType: 'flood',
                location: 'Kerala, India',
                coordinates: [10.8505, 76.2711],
                targetAmount: 500000,
                raisedAmount: 325000,
                donorCount: 1250,
                daysLeft: 15,
                createdBy: {
                    name: 'Kerala Relief Foundation',
                    organization: 'Registered NGO',
                    verified: true
                },
                images: [
                    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
                ],
                urgencyLevel: 'critical',
                category: 'emergency',
                createdAt: '2024-01-15T10:00:00Z',
                isActive: true,
                updates: [
                    {
                        id: 'update-1',
                        title: 'Relief Supplies Distributed to 500 Families',
                        description: 'Thanks to your generous donations, we have successfully distributed food packets and clean water to 500 affected families.',
                        createdAt: '2024-01-20T14:30:00Z'
                    }
                ]
            },
            {
                id: 'camp-2',
                title: 'Rebuild Schools After Earthquake in Nepal',
                description: 'The recent earthquake destroyed 15 schools in rural Nepal, affecting 3,000 children. Help us rebuild these schools and restore education for the next generation.',
                disasterType: 'earthquake',
                location: 'Kathmandu, Nepal',
                coordinates: [27.7172, 85.3240],
                targetAmount: 750000,
                raisedAmount: 180000,
                donorCount: 420,
                daysLeft: 45,
                createdBy: {
                    name: 'Education for All Nepal',
                    organization: 'International NGO',
                    verified: true
                },
                images: [
                    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400',
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400'
                ],
                urgencyLevel: 'high',
                category: 'education',
                createdAt: '2024-01-10T08:00:00Z',
                isActive: true,
                updates: []
            },
            {
                id: 'camp-3',
                title: 'Medical Aid for Wildfire Burn Victims',
                description: 'Forest fires have left dozens with severe burns. We need funds for specialized medical treatment, burn care supplies, and rehabilitation support.',
                disasterType: 'fire',
                location: 'California, USA',
                coordinates: [36.7783, -119.4179],
                targetAmount: 300000,
                raisedAmount: 285000,
                donorCount: 890,
                daysLeft: 8,
                createdBy: {
                    name: 'Burn Recovery Foundation',
                    organization: 'Medical Charity',
                    verified: true
                },
                images: [
                    'https://images.unsplash.com/photo-1574482620831-8b4d0d6c6c7b?w=400'
                ],
                urgencyLevel: 'critical',
                category: 'medical',
                createdAt: '2024-01-12T12:00:00Z',
                isActive: true,
                updates: [
                    {
                        id: 'update-2',
                        title: '25 Patients Receiving Treatment',
                        description: 'Your donations have enabled us to provide specialized burn treatment to 25 patients. Medical supplies are being restocked daily.',
                        createdAt: '2024-01-22T09:15:00Z'
                    }
                ]
            }
        ];

        setCampaigns(mockCampaigns);
    };

    useEffect(() => {
        fetchCampaigns();
    }, [selectedCategory, selectedDisaster, sortBy]);

    const getDisasterIcon = (type: string) => {
        switch (type) {
            case 'flood': return '🌊';
            case 'earthquake': return '🌍';
            case 'fire': return '🔥';
            case 'cyclone': return '🌪️';
            case 'drought': return '🏜️';
            case 'landslide': return '⛰️';
            default: return '⚠️';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'medical': return '🏥';
            case 'shelter': return '🏠';
            case 'food': return '🍽️';
            case 'education': return '📚';
            case 'infrastructure': return '🏗️';
            case 'emergency': return '🚨';
            default: return '❤️';
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const calculateProgress = (raised: number, target: number) => {
        return Math.min((raised / target) * 100, 100);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const categoryMatch = selectedCategory === 'all' || campaign.category === selectedCategory;
        const disasterMatch = selectedDisaster === 'all' || campaign.disasterType === selectedDisaster;
        return categoryMatch && disasterMatch && campaign.isActive;
    });

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        switch (sortBy) {
            case 'urgent':
                const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
            case 'popular':
                return b.donorCount - a.donorCount;
            case 'ending':
                return a.daysLeft - b.daysLeft;
            case 'recent':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const handleDonate = (campaignId: string, amount: number) => {
        // In a real app, this would integrate with payment gateway
        toast.success(`Thank you for your donation of ${formatCurrency(amount)}!`);
        
        // Update campaign data
        setCampaigns(prev => prev.map(campaign => 
            campaign.id === campaignId 
                ? { 
                    ...campaign, 
                    raisedAmount: campaign.raisedAmount + amount,
                    donorCount: campaign.donorCount + 1
                }
                : campaign
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            🤝 Disaster Relief Crowdfunding
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                            Together, we can rebuild lives and communities. Support disaster relief efforts worldwide through the power of collective giving.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold">₹2.5Cr+</div>
                                <div className="text-blue-200">Total Raised</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">15,000+</div>
                                <div className="text-blue-200">Donors</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">50+</div>
                                <div className="text-blue-200">Active Campaigns</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="emergency">🚨 Emergency</option>
                                    <option value="medical">🏥 Medical</option>
                                    <option value="shelter">🏠 Shelter</option>
                                    <option value="food">🍽️ Food & Water</option>
                                    <option value="education">📚 Education</option>
                                    <option value="infrastructure">🏗️ Infrastructure</option>
                                </select>
                            </div>

                            {/* Disaster Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Disaster Type</label>
                                <select
                                    value={selectedDisaster}
                                    onChange={(e) => setSelectedDisaster(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="all">All Disasters</option>
                                    <option value="flood">🌊 Flood</option>
                                    <option value="earthquake">🌍 Earthquake</option>
                                    <option value="fire">🔥 Wildfire</option>
                                    <option value="cyclone">🌪️ Cyclone</option>
                                    <option value="drought">🏜️ Drought</option>
                                    <option value="landslide">⛰️ Landslide</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="urgent">Most Urgent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="ending">Ending Soon</option>
                                    <option value="recent">Recently Added</option>
                                </select>
                            </div>
                        </div>

                        {/* Create Campaign Button */}
                        <button
                            onClick={() => {
                                const token = localStorage.getItem('token');
                                if (!token) {
                                    toast.error('Please login to create a campaign');
                                    return;
                                }
                                setShowCreateModal(true);
                            }}
                            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Start Campaign</span>
                        </button>
                    </div>
                </div>

                {/* Campaign Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedCampaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Campaign Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={campaign.images[0]}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 flex space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getUrgencyColor(campaign.urgencyLevel)}`}>
                                        {campaign.urgencyLevel.toUpperCase()}
                                    </span>
                                    <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                        {getDisasterIcon(campaign.disasterType)} {campaign.disasterType.toUpperCase()}
                                    </span>
                                </div>
                                {campaign.createdBy.verified && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle className="text-green-500 bg-white rounded-full" size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Campaign Content */}
                            <div className="p-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg">{getCategoryIcon(campaign.category)}</span>
                                    <span className="text-sm text-gray-500 capitalize">{campaign.category}</span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {campaign.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {campaign.description}
                                </p>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin size={16} className="mr-1" />
                                    <span>{campaign.location}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(campaign.raisedAmount)} raised
                                        </span>
                                        <span className="text-gray-500">
                                            {Math.round(calculateProgress(campaign.raisedAmount, campaign.targetAmount))}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${calculateProgress(campaign.raisedAmount, campaign.targetAmount)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Goal: {formatCurrency(campaign.targetAmount)}</span>
                                        <span>{campaign.donorCount} donors</span>
                                    </div>
                                </div>

                                {/* Campaign Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        <span>{campaign.daysLeft} days left</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users size={16} className="mr-1" />
                                        <span>{campaign.donorCount} supporters</span>
                                    </div>
                                </div>

                                {/* Creator Info */}
                                <div className="border-t pt-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {campaign.createdBy.name}
                                            </p>
                                            {campaign.createdBy.organization && (
                                                <p className="text-xs text-gray-500">
                                                    {campaign.createdBy.organization}
                                                </p>
                                            )}
                                        </div>
                                        {campaign.createdBy.verified && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setSelectedCampaign(campaign)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleDonate(campaign.id, 1000)}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                                    >
                                        <Heart size={16} className="inline mr-1" />
                                        Donate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {sortedCampaigns.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                        <p className="text-gray-600">Try adjusting your filters to see more campaigns.</p>
                    </div>
                )}
            </div>

            {/* Campaign Details Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedCampaign.title}
                                </h2>
                                <button
                                    onClick={() => setSelectedCampaign(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <img
                                        src={selectedCampaign.images[0]}
                                        alt={selectedCampaign.title}
                                        className="w-full h-64 object-cover rounded-lg mb-4"
                                    />
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Campaign Progress</h3>
                                        <div className="mb-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{formatCurrency(selectedCampaign.raisedAmount)} raised</span>
                                                <span>{Math.round(calculateProgress(selectedCampaign.raisedAmount, selectedCampaign.targetAmount))}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full"
                                                    style={{ width: `${calculateProgress(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Goal: {formatCurrency(selectedCampaign.targetAmount)}</span>
                                            <span>{selectedCampaign.donorCount} donors</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-700 mb-6">
                                        {selectedCampaign.description}
                                    </p>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center">
                                            <MapPin className="text-gray-500 mr-2" size={20} />
                                            <span>{selectedCampaign.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="text-gray-500 mr-2" size={20} />
                                            <span>{selectedCampaign.daysLeft} days remaining</span>
                                        </div>
                                        <div className="flex items-center">
                                            <AlertTriangle className="text-gray-500 mr-2" size={20} />
                                            <span className="capitalize">{selectedCampaign.urgencyLevel} priority</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-2">Quick Donate</h4>
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {[500, 1000, 2500].map(amount => (
                                                <button
                                                    key={amount}
                                                    onClick={() => handleDonate(selectedCampaign.id, amount)}
                                                    className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                                                >
                                                    {formatCurrency(amount)}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleDonate(selectedCampaign.id, 5000)}
                                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                                        >
                                            <Heart size={20} className="inline mr-2" />
                                            Donate Custom Amount
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Updates */}
                            {selectedCampaign.updates.length > 0 && (
                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-4">Campaign Updates</h3>
                                    <div className="space-y-4">
                                        {selectedCampaign.updates.map(update => (
                                            <div key={update.id} className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium mb-2">{update.title}</h4>
                                                <p className="text-gray-600 text-sm mb-2">{update.description}</p>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(update.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            <CreateCampaignModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchCampaigns(); // Refresh campaigns after creation
                }}
            />
        </div>
    );
};

export default DisasterFundraising;
