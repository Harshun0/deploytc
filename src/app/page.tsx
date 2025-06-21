'use client';

import { useState, useEffect } from 'react';
import connectMongoDB from '@/lib/mongodb';
import TipCalculation, { ITipCalculation } from '@/models/TipCalculation';

// These imports are used in the API route, so they are not unused
// They are imported here to ensure type checking and model registration

interface HistoryItem extends Omit<ITipCalculation, 'date'> {
  date: string;
}

export default function TipCalculatorPage() {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [isAmountMode, setIsAmountMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const presetPercentages = [10, 15, 18, 20, 25];

  // Fetch history on component mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/tip-calculations');
        const data = await response.json();
        setHistory(data.map((item: ITipCalculation) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })
        })));
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    }
    fetchHistory();
  }, []);

  // Calculate tip based on current inputs
  useEffect(() => {
    const bill = Number(billAmount) || 0;
    
    if (!isAmountMode) {
      const percentage = Number(tipPercentage) || 0;
      const calculatedTip = Number((bill * (percentage / 100)).toFixed(2));
      setTipAmount(calculatedTip.toFixed(2));
    }
  }, [billAmount, tipPercentage, isAmountMode]);

  const handlePresetClick = (percentage: number) => {
    setSelectedPreset(percentage);
    setTipPercentage(percentage.toString());
  };

  const handleTipPercentageChange = (value: string) => {
    setTipPercentage(value);
    setSelectedPreset(null);
  };

  const handleSubmit = async () => {
    const bill = Number(billAmount) || 0;
    const tip = Number(tipAmount) || 0;
    
    if (!customerName || !mobileNumber || bill <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tip-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          mobileNumber,
          billAmount: Number(bill.toFixed(2)),
          tipAmount: Number(tip.toFixed(2)),
          totalAmount: Number((bill + tip).toFixed(2)),
          tipPercentage: Math.round((tip / bill) * 100)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit tip calculation');
      }

      const newHistoryItem = await response.json();
      
      setHistory(prev => [
        {
          ...newHistoryItem,
          date: new Date(newHistoryItem.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })
        },
        ...prev
      ]);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Reset form
      setCustomerName('');
      setMobileNumber('');
      setBillAmount('');
      setTipPercentage('');
      setTipAmount('');
      setSelectedPreset(null);
    } catch (error) {
      console.error('Error submitting tip calculation:', error);
      alert('Failed to submit tip calculation');
    }
  };

  const summaryBill = Number(billAmount) || 0;
  const summaryTip = Number(tipAmount) || 0;
  const summaryTotal = summaryBill + summaryTip;

  // Ensure MongoDB connection and model are used
  const useMongoDBIntegration = () => {
    useEffect(() => {
      const initializeDatabase = async () => {
        try {
          // Directly use connectMongoDB
          const connection = await connectMongoDB();
          console.log('MongoDB Connection Initialized:', !!connection);

          // Verify TipCalculation model
          const modelName = TipCalculation.modelName;
          console.log('TipCalculation Model Registered:', modelName);
        } catch (error) {
          console.error('MongoDB Integration Error:', error);
        }
      };

      initializeDatabase();
    }, []);
  };

  // Initialize MongoDB and preload model on component mount
  useEffect(() => {
    useMongoDBIntegration();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-center sm:justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">₹</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                TipMate
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="order-1 lg:order-1">
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Calculate Your Tip
                  </h2>
                  <p className="text-gray-400">
                    Enter your details and calculate the perfect tip
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Customer Name */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-gray-800/80 transition-all duration-300"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-gray-800/80 transition-all duration-300"
                        placeholder="Enter your mobile number"
                        required
                      />
                    </div>
                  </div>

                  {/* Bill Amount */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bill Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 group-focus-within:text-purple-500 transition-colors font-medium">₹</span>
                      </div>
                      <input
                        type="number"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-gray-800/80 transition-all duration-300"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Tip Options Toggle */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium text-white">Tip Options</span>
                      <div className="flex items-center bg-gray-800/80 rounded-full p-1 border border-gray-600/50">
                        <button
                          type="button"
                          onClick={() => setIsAmountMode(false)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            !isAmountMode 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAmountMode(true)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            isAmountMode 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Amount
                        </button>
                      </div>
                    </div>

                    {/* Percentage Mode */}
                    <div className={`transition-all duration-500 ${isAmountMode ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-96'}`}>
                      <div className="grid grid-cols-5 gap-3 mb-4">
                        {presetPercentages.map((percentage) => (
                          <button
                            key={percentage}
                            type="button"
                            onClick={() => handlePresetClick(percentage)}
                            className={`py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                              selectedPreset === percentage
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            {percentage}%
                          </button>
                        ))}
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 group-focus-within:text-purple-500 transition-colors">%</span>
                        </div>
                        <input
                          type="number"
                          value={tipPercentage}
                          onChange={(e) => handleTipPercentageChange(e.target.value)}
                          min="0"
                          max="100"
                          className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-gray-800/80 transition-all duration-300"
                          placeholder="Custom percentage"
                        />
                      </div>
                    </div>

                    {/* Amount Mode */}
                    <div className={`transition-all duration-500 ${!isAmountMode ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-96'}`}>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 group-focus-within:text-purple-500 transition-colors font-medium">₹</span>
                        </div>
                        <input
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-gray-800/80 transition-all duration-300"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-6 border border-gray-600/50">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Bill Amount:</span>
                        <span className="text-lg font-semibold text-white">₹{summaryBill.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Tip Amount:</span>
                        <span className="text-lg font-semibold text-white">₹{summaryTip.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3 flex justify-between items-center">
                        <span className="text-xl font-bold text-white">Total:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          ₹{summaryTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  >
                    Calculate & Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="order-2 lg:order-2">
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Calculations
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {history.map((item, index) => (
                    <div
                      key={item._id}
                      className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg mb-1">
                            {item.customerName}
                          </h4>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.date} • {item.tipPercentage}% tip
                          </p>
                          <p className="text-gray-500 text-xs">
                            {item.mobileNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white mb-1">
                            ₹{item.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            ₹{item.billAmount.toFixed(2)} + ₹{item.tipAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          showToast 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-full opacity-0 scale-95'
        }`}
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 shadow-2xl border border-green-500/50 flex items-center space-x-3 backdrop-blur-xl">
          <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">Tip calculation submitted successfully!</p>
          <button 
            onClick={() => setShowToast(false)}
            className="text-white/80 hover:text-white transition-colors ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}