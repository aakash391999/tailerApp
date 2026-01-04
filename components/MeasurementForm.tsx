import React, { useState } from 'react';
import { Measurements } from '../types';
import { Save, Ruler } from 'lucide-react';

interface MeasurementFormProps {
    initialMeasurements?: Measurements;
    onSave: (measurements: Measurements) => Promise<void>;
    readOnly?: boolean;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ initialMeasurements = {}, onSave, readOnly = false }) => {
    const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof Measurements, value: string) => {
        setMeasurements(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(measurements);
        setLoading(false);
    };

    const fields: { key: keyof Measurements; label: string; placeholder: string }[] = [
        { key: 'neck', label: 'Neck', placeholder: '15"' },
        { key: 'shoulder', label: 'Shoulder', placeholder: '18"' },
        { key: 'chest', label: 'Chest', placeholder: '40"' },
        { key: 'waist', label: 'Waist', placeholder: '34"' },
        { key: 'hips', label: 'Hips', placeholder: '42"' },
        { key: 'sleeveLength', label: 'Sleeve Length', placeholder: '25"' },
        { key: 'shirtLength', label: 'Shirt Length', placeholder: '28"' },
        { key: 'pantWaist', label: 'Pant Waist', placeholder: '34"' },
        { key: 'pantLength', label: 'Pant Length', placeholder: '40"' },
        { key: 'inseam', label: 'Inseam', placeholder: '30"' },
        { key: 'thigh', label: 'Thigh', placeholder: '24"' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-serif font-bold text-lg flex items-center">
                    <Ruler className="mr-2 h-5 w-5 text-gold-500" /> Body Measurements
                </h3>
                {!readOnly && (
                    <span className="text-xs text-gray-400 bg-slate-800 px-2 py-1 rounded">Inches</span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {fields.map(({ key, label, placeholder }) => (
                        <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                {label}
                            </label>
                            {readOnly ? (
                                <div className="text-slate-900 font-medium text-lg border-b border-gray-100 pb-1">
                                    {measurements[key] || '-'}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={measurements[key] || ''}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-2 text-sm border"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {!readOnly && (
                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-gold-500 text-slate-900 font-bold py-2 px-6 rounded-lg hover:bg-gold-600 transition-colors shadow disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Measurements</>}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MeasurementForm;
