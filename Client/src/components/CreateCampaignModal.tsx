import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    X, 
    Upload, 
    MapPin, 
    FileText,
    CreditCard
} from 'lucide-react';
import axios from 'axios';

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        disasterType: '',
        category: '',
        urgencyLevel: 'medium',
        targetAmount: '',
        location: {
            address: '',
            city: '',
            state: '',
            coordinates: [0, 0]
        },
        organizationName: '',
        organizationType: 'individual',
        contactInfo: {
            phone: '',
            email: '',
            website: ''
        },
        bankDetails: {
            accountNumber: '',
            ifscCode: '',
            accountHolderName: '',
            bankName: ''
        },
        campaignDuration: {
            endDate: ''
        },
        tags: [],
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: ''
        }
    });
    const [images, setImages] = useState<FileList | null>(null);
    const [documents, setDocuments] = useState<FileList | null>(null);

    const steps = [
        { number: 1, title: 'Basic Info', description: 'Campaign details' },
        { number: 2, title: 'Location & Contact', description: 'Where and how to reach' },
        { number: 3, title: 'Financial Details', description: 'Banking information' },
        { number: 4, title: 'Media & Documents', description: 'Images and verification' }
    ];

    const disasterTypes = [
        { value: 'flood', label: '🌊 Flood', description: 'Water-related disasters' },
        { value: 'earthquake', label: '🌍 Earthquake', description: 'Seismic activities' },
        { value: 'fire', label: '🔥 Wildfire', description: 'Fire-related emergencies' },
        { value: 'cyclone', label: '🌪️ Cyclone', description: 'Storm and wind damage' },
        { value: 'drought', label: '🏜️ Drought', description: 'Water scarcity issues' },
        { value: 'landslide', label: '⛰️ Landslide', description: 'Geological disasters' },
        { value: 'other', label: '⚠️ Other', description: 'Other natural disasters' }
    ];

    const categories = [
        { value: 'emergency', label: '🚨 Emergency Relief', description: 'Immediate assistance needed' },
        { value: 'medical', label: '🏥 Medical Aid', description: 'Healthcare and treatment' },
        { value: 'shelter', label: '🏠 Shelter & Housing', description: 'Temporary accommodation' },
        { value: 'food', label: '🍽️ Food & Water', description: 'Basic necessities' },
        { value: 'education', label: '📚 Education', description: 'Schools and learning' },
        { value: 'infrastructure', label: '🏗️ Infrastructure', description: 'Rebuilding facilities' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof prev] as any),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLocationDetection = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            coordinates: [position.coords.longitude, position.coords.latitude]
                        }
                    }));
                    toast.success('Location detected successfully!');
                },
                () => {
                    toast.error('Failed to detect location. Please enter manually.');
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser.');
        }
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return formData.title && formData.description && formData.shortDescription && 
                       formData.disasterType && formData.category && formData.targetAmount;
            case 2:
                return formData.location.address && formData.location.city && formData.location.state &&
                       formData.contactInfo.phone && formData.contactInfo.email;
            case 3:
                return formData.bankDetails.accountNumber && formData.bankDetails.ifscCode &&
                       formData.bankDetails.accountHolderName && formData.bankDetails.bankName;
            case 4:
                return images && images.length > 0;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        } else {
            toast.error('Please fill in all required fields');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) {
            toast.error('Please complete all required fields');
            return;
        }

        setLoading(true);
        try {
            const userId = localStorage.getItem('id');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                toast.error('Please login to create a campaign');
                return;
            }

            const formDataToSend = new FormData();
            
            // Add form data
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (typeof value === 'object' && value !== null) {
                    formDataToSend.append(key, JSON.stringify(value));
                } else {
                    formDataToSend.append(key, value as string);
                }
            });

            // Add images
            if (images) {
                Array.from(images).forEach(image => {
                    formDataToSend.append('images', image);
                });
            }

            // Add documents
            if (documents) {
                Array.from(documents).forEach(doc => {
                    formDataToSend.append('documents', doc);
                });
            }

            const response = await axios.post(
                `http://localhost:8000/api/v1/campaign/campaigns/create/${userId}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Campaign created successfully! It will be reviewed by our team.');
                onSuccess();
                onClose();
            }

        } catch (error: any) {
            console.error('Campaign creation error:', error);
            toast.error(error.response?.data?.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
                            <p className="text-gray-600">Help your community by starting a fundraising campaign</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                        currentStep >= step.number 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {step.number}
                                    </div>
                                    <div className="ml-2 hidden sm:block">
                                        <div className="text-sm font-medium">{step.title}</div>
                                        <div className="text-xs text-gray-500">{step.description}</div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-1 mx-4 ${
                                            currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Campaign Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter a compelling campaign title"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description *
                                </label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    placeholder="Brief summary (will be shown on campaign cards)"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={300}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Detailed Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed information about your campaign, the disaster impact, and how funds will be used"
                                    rows={6}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    maxLength={2000}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Disaster Type *
                                    </label>
                                    <select
                                        name="disasterType"
                                        value={formData.disasterType}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select disaster type</option>
                                        {disasterTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        value={formData.targetAmount}
                                        onChange={handleInputChange}
                                        placeholder="Enter target amount"
                                        min="1000"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Urgency Level
                                    </label>
                                    <select
                                        name="urgencyLevel"
                                        value={formData.urgencyLevel}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Campaign End Date *
                                </label>
                                <input
                                    type="date"
                                    name="campaignDuration.endDate"
                                    value={formData.campaignDuration.endDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location & Contact */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address *
                                </label>
                                <textarea
                                    name="location.address"
                                    value={formData.location.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter complete address where disaster occurred"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleInputChange}
                                        placeholder="Enter city"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="location.state"
                                        value={formData.location.state}
                                        onChange={handleInputChange}
                                        placeholder="Enter state"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleLocationDetection}
                                    className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    <MapPin size={16} />
                                    <span>Detect Current Location</span>
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Organization Type
                                    </label>
                                    <select
                                        name="organizationType"
                                        value={formData.organizationType}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="individual">Individual</option>
                                        <option value="ngo">NGO</option>
                                        <option value="charity">Charity</option>
                                        <option value="government">Government</option>
                                        <option value="corporate">Corporate</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleInputChange}
                                        placeholder="Enter organization name (if applicable)"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactInfo.phone"
                                        value={formData.contactInfo.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="contactInfo.email"
                                        value={formData.contactInfo.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="contactInfo.website"
                                    value={formData.contactInfo.website}
                                    onChange={handleInputChange}
                                    placeholder="Enter website URL"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Financial Details */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <CreditCard className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Bank Account Information
                                        </h3>
                                        <p className="mt-1 text-sm text-yellow-700">
                                            This information is required for fund transfers. All details will be verified before campaign approval.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Holder Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="bankDetails.accountHolderName"
                                        value={formData.bankDetails.accountHolderName}
                                        onChange={handleInputChange}
                                        placeholder="Enter account holder name"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="bankDetails.bankName"
                                        value={formData.bankDetails.bankName}
                                        onChange={handleInputChange}
                                        placeholder="Enter bank name"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="bankDetails.accountNumber"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter account number"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IFSC Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="bankDetails.ifscCode"
                                        value={formData.bankDetails.ifscCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter IFSC code"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links (Optional)</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="url"
                                            name="socialLinks.facebook"
                                            value={formData.socialLinks.facebook}
                                            onChange={handleInputChange}
                                            placeholder="https://facebook.com/your-page"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="url"
                                            name="socialLinks.twitter"
                                            value={formData.socialLinks.twitter}
                                            onChange={handleInputChange}
                                            placeholder="https://twitter.com/your-handle"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Media & Documents */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Campaign Images * (Max 5 images)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-2">
                                        <label htmlFor="images" className="cursor-pointer">
                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                Upload campaign images
                                            </span>
                                            <span className="mt-1 block text-sm text-gray-500">
                                                PNG, JPG, GIF up to 10MB each
                                            </span>
                                        </label>
                                        <input
                                            id="images"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setImages(e.target.files)}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {images && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        {images.length} image(s) selected
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supporting Documents (Optional, Max 3 files)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-2">
                                        <label htmlFor="documents" className="cursor-pointer">
                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                Upload verification documents
                                            </span>
                                            <span className="mt-1 block text-sm text-gray-500">
                                                PDF, Images - ID proof, organization certificates, etc.
                                            </span>
                                        </label>
                                        <input
                                            id="documents"
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf"
                                            onChange={(e) => setDocuments(e.target.files)}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {documents && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        {documents.length} document(s) selected
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FileText className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Review Process
                                        </h3>
                                        <p className="mt-1 text-sm text-blue-700">
                                            Your campaign will be reviewed by our team within 24-48 hours. You'll receive an email notification once it's approved and goes live.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex space-x-3">
                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Submit Campaign'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateCampaignModal;

