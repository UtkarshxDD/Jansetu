import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import fimg from '../assets/userImgF.jpg'
import mimg from '../assets/userImgM.jpg'

// Mock official data
const officialsData = {
    'Municipal Officer': {
      about: 'Municipal Officers oversee city-level operations and ensure that urban services are maintained efficiently.',
      applicableAreas: ['Waste Management', 'Urban Planning', 'Public Infrastructure'],
      currentArea: 'Delhi North Zone',
      officials: [
        {
          id: 'officer-1',
          name: 'Rajesh Kumar',
          image: mimg,
          contact: 'rajesh.kumar@delhimunicipal.in',
        },
        {
          id: 'officer-2',
          name: 'Sneha Patel',
          image: fimg,
          contact: 'sneha.patel@delhimunicipal.in',
        },
      ],
    },
  
    'City Engineer': {
      about: 'City Engineers plan and manage construction, maintenance, and development of urban infrastructure.',
      applicableAreas: ['Road Construction', 'Water Systems', 'Urban Development'],
      currentArea: 'Bangalore East',
      officials: [
        {
          id: 'officer-3',
          name: 'Anil Deshmukh',
          image: mimg,
          contact: 'anil.deshmukh@bangalore.gov.in',
        },
        {
          id: 'officer-4',
          name: 'Kavita Joshi',
          image: fimg,
          contact: 'kavita.joshi@bangalore.gov.in',
        },
      ],
    },
  
    'Sanitation Department': {
      about: 'Responsible for cleanliness, waste disposal, and public hygiene in their assigned region.',
      applicableAreas: ['Public Health', 'Waste Collection', 'Street Cleaning'],
      currentArea: 'Mumbai Zone 3',
      officials: [
        {
          id: 'officer-5',
          name: 'Amit Verma',
          image: mimg,
          contact: 'amit.verma@mumbaisanitation.in',
        },
        {
          id: 'officer-6',
          name: 'Farah Khan',
          image: fimg,
          contact: 'farah.khan@mumbaisanitation.in',
        },
      ],
    },
  
    'Road & Transport Authority': {
      about: 'Manages transportation planning, traffic control, and road maintenance.',
      applicableAreas: ['Traffic Management', 'Road Safety', 'Public Transport'],
      currentArea: 'Chennai Central',
      officials: [
        {
          id: 'officer-7',
          name: 'Ravi Subramaniam',
          image: mimg,
          contact: 'ravi.subramaniam@chennairta.in',
        },
        {
          id: 'officer-8',
          name: 'Nandita Rao',
          image: fimg,
          contact: 'nandita.rao@chennairta.in',
        },
      ],
    },
  
    'Water Supply Officer': {
      about: 'Oversees the distribution and quality of water supply in the designated area.',
      applicableAreas: ['Water Treatment', 'Distribution Lines', 'Leak Management'],
      currentArea: 'Pune City South',
      officials: [
        {
          id: 'officer-9',
          name: 'Manoj Naik',
          image: mimg,
          contact: 'manoj.naik@punewater.in',
        },
        {
          id: 'officer-10',
          name: 'Divya Shah',
          image: fimg,
          contact: 'divya.shah@punewater.in',
        },
      ],
    },
  
    'Public Safety & Surveillance': {
      about: 'Handles installation and monitoring of surveillance systems and ensures public safety protocols.',
      applicableAreas: ['CCTV Monitoring', 'Emergency Response', 'Public Order'],
      currentArea: 'Hyderabad Zone 2',
      officials: [
        {
          id: 'officer-11',
          name: 'Prakash Mehta',
          image: mimg,
          contact: 'prakash.mehta@hydsafety.in',
        },
        {
          id: 'officer-12',
          name: 'Neha Thakur',
          image: fimg,
          contact: 'neha.thakur@hydsafety.in',
        },
      ],
    },
  };
  

const Officials: React.FC = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'Municipal Officer'; // fallback role

  const roleData = officialsData[role as keyof typeof officialsData];

  if (!roleData) {
    return <div className="p-8 text-red-600 text-xl">No data found for role: {role}</div>;
  }

  return (
    <div className="p-8 bg-[#fbfbf3] text-black min-h-screen">
      {/* Role Heading Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{role}</h1>
        <p className="text-lg mb-1">{roleData.about}</p>
        <p className="text-sm text-gray-700 mb-1">
          <strong>Applicable Areas:</strong> {roleData.applicableAreas.join(', ')}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Current Area:</strong> {roleData.currentArea}
        </p>
      </div>

      {/* Officials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {roleData.officials.map((official) => (
            <Link
                to={`/officialsDashboard`}
                key={official.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transform transition duration-300 ease-in-out"
            >
                <div className="flex flex-col items-center text-center">
                    <img
                    src={official.image}
                    alt={official.name}
                    className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-black"
                    />
                    <h2 className="text-xl font-semibold text-gray-900">{official.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{official.contact}</p>
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default Officials;
