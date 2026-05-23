const API_BASE_URL = 'http://localhost:8000/api/v1/users';

const etahCenter = { lat: 27.5684, lng: 78.6501 };

function randomOffset() {
  return (Math.random() - 0.5) * 0.05; // ~3km radius
}

const demoUser = {
  name: "Etah Demo User",
  email: "demo@jansetu.com",
  password: "password123",
  phone: "9876543210",
  location: {
    type: "Point",
    coordinates: [etahCenter.lng, etahCenter.lat]
  }
};

const baseIssues = [
  { title: "Large Pothole on Main Road", desc: "There is a massive pothole causing severe traffic delays and vehicle damage.", cat: "Road", rating: 5, prio: "high" },
  { title: "Overflowing Garbage Dumpster", desc: "The garbage dumpster has not been cleared for 3 days and is causing a terrible stench.", cat: "Sanitation", rating: 4, prio: "medium" },
  { title: "Streetlight not working", desc: "The streetlight has been out for a week, making the intersection very dark.", cat: "Electricity", rating: 3, prio: "medium" },
  { title: "Sewer Pipe Leakage", desc: "Dirty sewage water is flowing onto the pedestrian walkway.", cat: "Water Supply", rating: 5, prio: "high" },
  { title: "Broken Footpath", desc: "The footpath tiles are completely broken and uneven.", cat: "Infrastructure", rating: 2, prio: "low" },
  { title: "Stray Dogs creating panic", desc: "A pack of aggressive stray dogs has bitten two people in the last week.", cat: "Public Safety", rating: 4, prio: "high" },
  { title: "Illegal Tree Cutting", desc: "Someone is illegally cutting down old banyan trees near the public park at night.", cat: "Environment", rating: 4, prio: "medium" },
  { title: "Water Logging after rain", desc: "Even after a small rain, the street gets flooded. Drainage system is blocked.", cat: "Water Supply", rating: 5, prio: "high" },
  { title: "Open Manhole", desc: "An open manhole in the middle of the road. Highly dangerous.", cat: "Road", rating: 5, prio: "high" },
  { title: "Garbage thrown in empty plot", desc: "People are throwing domestic waste into the empty plot in our area.", cat: "Sanitation", rating: 3, prio: "low" }
];

// Generate 40 issues for a good heatmap
const issues = [];
for (let i = 0; i < 40; i++) {
  const base = baseIssues[i % baseIssues.length];
  issues.push({
    title: base.title + (i >= 10 ? ` #${i+1}` : ''),
    description: base.desc,
    category: base.cat,
    rating: base.rating,
    priority: base.prio
  });
}

async function seed() {
  try {
    console.log("Registering Demo User...");
    let userRes;
    let userData;
    try {
        userRes = await fetch(`${API_BASE_URL}/signupUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoUser)
        });
        
        // Always login to guarantee we get the token, whether signup worked or user already existed
        console.log("Logging in to get token...");
        userRes = await fetch(`${API_BASE_URL}/loginUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: demoUser.email, password: demoUser.password })
        });
        userData = await userRes.json();
        
        if (!userRes.ok) {
             throw new Error(userData.message || 'Login failed after signup');
        }
    } catch (err) {
        console.error("Auth failed:", err.message);
        return;
    }
    
    if (!userData.token) {
        console.error("No token received", userData);
        return;
    }

    const token = userData.token;
    const userId = userData.user?._id || userData.user?.id;
    console.log(`User ID: ${userId}`);

    console.log("Creating 10 Issues in Etah...");
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const lat = etahCenter.lat + randomOffset();
      const lng = etahCenter.lng + randomOffset();

      const formData = new FormData();
      formData.append('title', issue.title);
      formData.append('description', issue.description);
      formData.append('category', issue.category);
      formData.append('coordinates', JSON.stringify([lng, lat]));
      formData.append('rating', issue.rating.toString());
      formData.append('priority', issue.priority);

      try {
        const res = await fetch(`${API_BASE_URL}/createProblem/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const resData = await res.json();
        if (res.ok) {
            console.log(`Created: ${issue.title} at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        } else {
            console.error(`Failed to create ${issue.title}:`, resData);
        }
      } catch (err) {
        console.error(`Failed to create ${issue.title}:`, err.message);
      }
    }
    
    console.log("\n✅ Seeding complete!");
    console.log("\nDemo Credentials:");
    console.log("Email:", demoUser.email);
    console.log("Password:", demoUser.password);
    console.log("Location:", "Etah, UP");

  } catch (err) {
    console.error("Seeding failed:", err.message);
  }
}

seed();
