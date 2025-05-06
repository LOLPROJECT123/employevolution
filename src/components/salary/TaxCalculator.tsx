
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Calculator, Download } from "lucide-react";

// Tax rates by country (simplified version based on taxes.fyi)
const TAX_RATES = {
  US: {
    name: "United States",
    federalBrackets: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11001, max: 44725, rate: 0.12 },
      { min: 44726, max: 95375, rate: 0.22 },
      { min: 95376, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578125, rate: 0.35 },
      { min: 578126, max: Infinity, rate: 0.37 }
    ],
    standardDeduction: 13850,
    medicareTax: 0.0145,
    socialSecurityTax: 0.062,
    socialSecurityWageCap: 168600,
    states: {
      "CA": { name: "California", maxRate: 0.133 },
      "NY": { name: "New York", maxRate: 0.107 },
      "TX": { name: "Texas", maxRate: 0 },
      "FL": { name: "Florida", maxRate: 0 },
      "WA": { name: "Washington", maxRate: 0 },
      // Add more states as needed
    }
  },
  UK: {
    name: "United Kingdom",
    incomeTaxBrackets: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 50270, rate: 0.20 },
      { min: 50271, max: 125140, rate: 0.40 },
      { min: 125141, max: Infinity, rate: 0.45 }
    ],
    nationalInsurance: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 50270, rate: 0.12 },
      { min: 50271, max: Infinity, rate: 0.02 }
    ]
  },
  // Add more countries as needed
};

interface TaxBreakdown {
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  nationalInsurance?: number;
}

const calculateUSTaxes = (income: number, state: string): TaxBreakdown => {
  // Calculate federal tax
  let taxableIncome = Math.max(0, income - TAX_RATES.US.standardDeduction);
  let federalTax = 0;
  
  for (const bracket of TAX_RATES.US.federalBrackets) {
    if (taxableIncome > bracket.min) {
      const taxableAmount = Math.min(taxableIncome, bracket.max) - bracket.min;
      federalTax += taxableAmount * bracket.rate;
    }
    
    if (taxableIncome <= bracket.max) break;
  }
  
  // Calculate state tax (simplified)
  const stateInfo = TAX_RATES.US.states[state as keyof typeof TAX_RATES.US.states];
  const stateTax = stateInfo ? income * stateInfo.maxRate / 2 : 0; // Simplified calculation
  
  // Calculate FICA taxes
  const socialSecurity = Math.min(income, TAX_RATES.US.socialSecurityWageCap) * TAX_RATES.US.socialSecurityTax;
  const medicare = income * TAX_RATES.US.medicareTax;
  
  const totalTax = federalTax + stateTax + socialSecurity + medicare;
  const netIncome = income - totalTax;
  const effectiveTaxRate = totalTax / income;
  
  return {
    grossIncome: income,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalTax,
    netIncome,
    effectiveTaxRate
  };
};

const calculateUKTaxes = (income: number): TaxBreakdown => {
  // Calculate income tax
  let incomeTax = 0;
  
  for (const bracket of TAX_RATES.UK.incomeTaxBrackets) {
    if (income > bracket.min) {
      const taxableAmount = Math.min(income, bracket.max) - bracket.min;
      incomeTax += taxableAmount * bracket.rate;
    }
    
    if (income <= bracket.max) break;
  }
  
  // Calculate National Insurance
  let nationalInsurance = 0;
  
  for (const bracket of TAX_RATES.UK.nationalInsurance) {
    if (income > bracket.min) {
      const taxableAmount = Math.min(income, bracket.max) - bracket.min;
      nationalInsurance += taxableAmount * bracket.rate;
    }
    
    if (income <= bracket.max) break;
  }
  
  const totalTax = incomeTax + nationalInsurance;
  const netIncome = income - totalTax;
  const effectiveTaxRate = totalTax / income;
  
  return {
    grossIncome: income,
    federalTax: incomeTax,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    nationalInsurance,
    totalTax,
    netIncome,
    effectiveTaxRate
  };
};

const TaxCalculator: React.FC = () => {
  const [income, setIncome] = useState<number>(100000);
  const [country, setCountry] = useState<string>("US");
  const [state, setState] = useState<string>("CA");
  const [frequency, setFrequency] = useState<string>("annual");
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  
  useEffect(() => {
    calculateTaxes();
  }, [income, country, state, frequency]);
  
  const calculateTaxes = () => {
    try {
      // Convert income to annual if needed
      let annualIncome = income;
      if (frequency === "monthly") {
        annualIncome = income * 12;
      } else if (frequency === "biweekly") {
        annualIncome = income * 26;
      } else if (frequency === "weekly") {
        annualIncome = income * 52;
      } else if (frequency === "hourly") {
        annualIncome = income * 40 * 52; // Assuming 40-hour work week
      }
      
      // Calculate taxes based on country
      let result: TaxBreakdown;
      
      if (country === "US") {
        result = calculateUSTaxes(annualIncome, state);
      } else if (country === "UK") {
        result = calculateUKTaxes(annualIncome);
      } else {
        throw new Error("Unsupported country");
      }
      
      setTaxBreakdown(result);
    } catch (error) {
      console.error("Error calculating taxes:", error);
      toast.error("Error calculating taxes. Please check your inputs.");
    }
  };
  
  const formatCurrency = (amount: number): string => {
    const currencySymbol = country === "UK" ? "£" : "$";
    return `${currencySymbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };
  
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setIncome(value);
    } else {
      setIncome(0);
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    setIncome(value[0]);
  };
  
  const downloadTaxReport = () => {
    if (!taxBreakdown) return;
    
    const formatPercentage = (value: number): string => {
      return `${(value * 100).toFixed(2)}%`;
    };
    
    let reportContent = `Tax Calculation Report\n`;
    reportContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    reportContent += `Country: ${TAX_RATES[country as keyof typeof TAX_RATES].name}\n`;
    if (country === "US") {
      reportContent += `State: ${TAX_RATES.US.states[state as keyof typeof TAX_RATES.US.states]?.name || "N/A"}\n`;
    }
    reportContent += `Gross Income (${frequency}): ${formatCurrency(income)}\n`;
    reportContent += `Gross Income (annual): ${formatCurrency(taxBreakdown.grossIncome)}\n\n`;
    reportContent += `Tax Breakdown:\n`;
    reportContent += `- Federal Income Tax: ${formatCurrency(taxBreakdown.federalTax)}\n`;
    
    if (country === "US") {
      reportContent += `- State Income Tax: ${formatCurrency(taxBreakdown.stateTax)}\n`;
      reportContent += `- Social Security: ${formatCurrency(taxBreakdown.socialSecurity)}\n`;
      reportContent += `- Medicare: ${formatCurrency(taxBreakdown.medicare)}\n`;
    } else if (country === "UK") {
      reportContent += `- National Insurance: ${formatCurrency(taxBreakdown.nationalInsurance || 0)}\n`;
    }
    
    reportContent += `\nTotal Tax: ${formatCurrency(taxBreakdown.totalTax)} (${formatPercentage(taxBreakdown.effectiveTaxRate)})\n`;
    reportContent += `Net Income (annual): ${formatCurrency(taxBreakdown.netIncome)}\n`;
    
    // Calculate take-home pay based on frequency
    let takeHomePay = taxBreakdown.netIncome;
    if (frequency === "monthly") {
      takeHomePay /= 12;
      reportContent += `Net Income (monthly): ${formatCurrency(takeHomePay)}\n`;
    } else if (frequency === "biweekly") {
      takeHomePay /= 26;
      reportContent += `Net Income (biweekly): ${formatCurrency(takeHomePay)}\n`;
    } else if (frequency === "weekly") {
      takeHomePay /= 52;
      reportContent += `Net Income (weekly): ${formatCurrency(takeHomePay)}\n`;
    } else if (frequency === "hourly") {
      takeHomePay /= (52 * 40); // Assuming 40-hour work week
      reportContent += `Net Income (hourly): ${formatCurrency(takeHomePay)}\n`;
    }
    
    // Create blob and download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tax_report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Tax report downloaded successfully");
  };
  
  const getMaxIncome = () => {
    switch (frequency) {
      case "annual":
        return 500000;
      case "monthly":
        return 50000;
      case "biweekly":
        return 20000;
      case "weekly":
        return 10000;
      case "hourly":
        return 500;
      default:
        return 500000;
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Salary Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="income">Income</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {country === "UK" ? "£" : "$"}
              </span>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={handleIncomeChange}
                className="flex-1"
              />
            </div>
            <Slider 
              value={[income]} 
              min={0} 
              max={getMaxIncome()}
              step={100}
              onValueChange={handleSliderChange}
              className="py-4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Pay Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {country === "US" && (
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAX_RATES.US.states).map(([code, stateInfo]) => (
                    <SelectItem key={code} value={code}>{stateInfo.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {taxBreakdown && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Tax Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex justify-between">
                <span>Gross Income ({frequency}):</span>
                <span className="font-semibold">{formatCurrency(income)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Annual Gross Income:</span>
                <span className="font-semibold">{formatCurrency(taxBreakdown.grossIncome)}</span>
              </div>
              
              <div className="flex justify-between text-red-500">
                <span>Federal Income Tax:</span>
                <span>-{formatCurrency(taxBreakdown.federalTax)}</span>
              </div>
              
              {country === "US" && (
                <>
                  <div className="flex justify-between text-red-500">
                    <span>State Income Tax:</span>
                    <span>-{formatCurrency(taxBreakdown.stateTax)}</span>
                  </div>
                  
                  <div className="flex justify-between text-red-500">
                    <span>Social Security:</span>
                    <span>-{formatCurrency(taxBreakdown.socialSecurity)}</span>
                  </div>
                  
                  <div className="flex justify-between text-red-500">
                    <span>Medicare:</span>
                    <span>-{formatCurrency(taxBreakdown.medicare)}</span>
                  </div>
                </>
              )}
              
              {country === "UK" && (
                <div className="flex justify-between text-red-500">
                  <span>National Insurance:</span>
                  <span>-{formatCurrency(taxBreakdown.nationalInsurance || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-red-500 font-medium">
                <span>Total Tax:</span>
                <span>-{formatCurrency(taxBreakdown.totalTax)}</span>
              </div>
              
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Annual Take-Home Pay:</span>
                <span>{formatCurrency(taxBreakdown.netIncome)}</span>
              </div>
              
              <div className="flex justify-between text-green-600 font-semibold">
                <span>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)} Take-Home Pay:
                </span>
                <span>
                  {formatCurrency(
                    frequency === "monthly" ? taxBreakdown.netIncome / 12 :
                    frequency === "biweekly" ? taxBreakdown.netIncome / 26 :
                    frequency === "weekly" ? taxBreakdown.netIncome / 52 :
                    frequency === "hourly" ? taxBreakdown.netIncome / (52 * 40) :
                    taxBreakdown.netIncome
                  )}
                </span>
              </div>
              
              <div className="flex justify-between col-span-1 md:col-span-2">
                <span>Effective Tax Rate:</span>
                <span className="font-medium">
                  {(taxBreakdown.effectiveTaxRate * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline" 
          onClick={downloadTaxReport}
          disabled={!taxBreakdown}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Tax Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaxCalculator;
