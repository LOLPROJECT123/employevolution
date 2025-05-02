
import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import TaxCalculator from "@/components/salary/TaxCalculator";
import { useIsMobile } from "@/hooks/use-mobile";

const SalaryCalculator: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Tax Calculator" />}
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Salary Tax Calculator
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Calculate your take-home pay after taxes based on your income and location.
            </p>
          </div>
          
          <div className="mb-8">
            <TaxCalculator />
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This salary calculator uses up-to-date tax rates to estimate your take-home pay after accounting for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Federal income tax (progressive tax brackets)</li>
              <li>State income tax (for US locations)</li>
              <li>Social Security and Medicare taxes (FICA for US)</li>
              <li>National Insurance (for UK)</li>
              <li>Standard deductions applicable to your situation</li>
            </ul>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Disclaimer</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                This calculator provides estimates only and should not be used for tax planning purposes. 
                Tax situations vary based on individual circumstances. Consult a tax professional for advice 
                tailored to your specific situation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalaryCalculator;
