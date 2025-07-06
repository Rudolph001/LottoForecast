import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  Home, 
  Car, 
  TrendingUp, 
  Banknote,
  ShoppingBag,
  Wallet,
  Plus,
  Trash2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BudgetAllocation {
  investecFixedDeposit: number;
  houses: number;
  cars: number;
  otherExpenses: number;
}

interface PropertyDetails {
  id: string;
  type: string;
  location: string;
  bedrooms: number;
  price: number;
  transferCosts: number;
  monthlyRates: number;
  insurance: number;
}

interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  insurance: number;
  maintenance: number;
  fuel: number;
}

interface ExpenseDetails {
  id: string;
  category: string;
  description: string;
  monthlyAmount: number;
  isRecurring: boolean;
}

interface TaxCalculation {
  monthlyInterest: number;
  annualInterest: number;
  taxableAmount: number;
  taxOwed: number;
  netMonthlyIncome: number;
}

interface ExchangeRateData {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export function BudgetDashboard() {
  const [jackpotAmount, setJackpotAmount] = useState<string>("74000000");
  const [interestRate, setInterestRate] = useState<string>("10.5");
  const [allocation, setAllocation] = useState<BudgetAllocation>({
    investecFixedDeposit: 60,
    houses: 25,
    cars: 10,
    otherExpenses: 5
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDetails[]>([]);

  const { data: exchangeRate } = useQuery<ExchangeRateData>({
    queryKey: ["/api/exchange-rate"],
    refetchInterval: 60000,
  });

  const jackpotEUR = parseFloat(jackpotAmount) || 0;
  const jackpotZAR = exchangeRate ? jackpotEUR * exchangeRate.rate : jackpotEUR * 20.71;
  const rate = parseFloat(interestRate) || 0;

  // Calculate allocations
  const investmentAmount = (jackpotZAR * allocation.investecFixedDeposit) / 100;
  const housesAmount = (jackpotZAR * allocation.houses) / 100;
  const carsAmount = (jackpotZAR * allocation.cars) / 100;
  const otherAmount = (jackpotZAR * allocation.otherExpenses) / 100;

  // Calculate tax on interest (South African tax rates 2024/25)
  const calculateTax = (): TaxCalculation => {
    const monthlyInterest = (investmentAmount * rate) / 100 / 12;
    const annualInterest = monthlyInterest * 12;
    
    // SA tax brackets 2024/25 (simplified for interest income)
    let taxRate = 0;
    if (annualInterest <= 237100) taxRate = 0.18;
    else if (annualInterest <= 370500) taxRate = 0.26;
    else if (annualInterest <= 512800) taxRate = 0.31;
    else if (annualInterest <= 673000) taxRate = 0.36;
    else if (annualInterest <= 857900) taxRate = 0.39;
    else if (annualInterest <= 1817000) taxRate = 0.41;
    else taxRate = 0.45;

    const taxOwed = annualInterest * taxRate;
    const netMonthlyIncome = monthlyInterest - (taxOwed / 12);

    return {
      monthlyInterest,
      annualInterest,
      taxableAmount: annualInterest,
      taxOwed,
      netMonthlyIncome
    };
  };

  const taxCalc = calculateTax();

  const handleAllocationChange = (category: keyof BudgetAllocation, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAllocation(prev => ({ ...prev, [category]: numValue }));
  };

  const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  // Estimation functions
  const estimateCarInsurance = (make: string, model: string, year: number, price: number): number => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    let baseRate = 0.08; // 8% of vehicle value as base
    
    // Adjust for vehicle age
    if (age < 3) baseRate = 0.12; // New cars higher premium
    else if (age > 10) baseRate = 0.06; // Older cars lower premium
    
    // Adjust for make (luxury brands cost more)
    const luxuryBrands = ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Porsche', 'Jaguar'];
    if (luxuryBrands.some(brand => make.toUpperCase().includes(brand.toUpperCase()))) {
      baseRate *= 1.3;
    }
    
    return Math.round(price * baseRate / 12); // Monthly premium
  };

  const estimateCarMaintenance = (make: string, year: number, price: number): number => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    let monthlyMaintenance = price * 0.02 / 12; // 2% of value annually
    
    // Increase with age
    if (age > 5) monthlyMaintenance *= 1.5;
    if (age > 10) monthlyMaintenance *= 2;
    
    return Math.round(monthlyMaintenance);
  };

  const estimatePropertyInsurance = (type: string, price: number, location: string): number => {
    let baseRate = 0.003; // 0.3% of property value annually
    
    // Adjust for property type
    if (type.toLowerCase().includes('apartment')) baseRate = 0.002;
    if (type.toLowerCase().includes('house')) baseRate = 0.0035;
    if (type.toLowerCase().includes('farm')) baseRate = 0.005;
    
    // Adjust for location (simplified)
    const highRiskAreas = ['Cape Town', 'Johannesburg', 'Durban'];
    if (highRiskAreas.some(area => location.toUpperCase().includes(area.toUpperCase()))) {
      baseRate *= 1.2;
    }
    
    return Math.round(price * baseRate / 12); // Monthly premium
  };

  const estimatePropertyRates = (price: number, location: string): number => {
    // Municipal rates typically 0.7-1.2% of property value annually
    let ratePercentage = 0.009; // 0.9% base
    
    const highRateAreas = ['Cape Town', 'Sandton', 'Camps Bay'];
    if (highRateAreas.some(area => location.toUpperCase().includes(area.toUpperCase()))) {
      ratePercentage = 0.012;
    }
    
    return Math.round(price * ratePercentage / 12);
  };

  const addProperty = () => {
    const newProperty: PropertyDetails = {
      id: Date.now().toString(),
      type: '',
      location: '',
      bedrooms: 3,
      price: 0,
      transferCosts: 0,
      monthlyRates: 0,
      insurance: 0
    };
    setProperties(prev => [...prev, newProperty]);
  };

  const addVehicle = () => {
    const newVehicle: VehicleDetails = {
      id: Date.now().toString(),
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      insurance: 0,
      maintenance: 0,
      fuel: 0
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const addExpense = () => {
    const newExpense: ExpenseDetails = {
      id: Date.now().toString(),
      category: '',
      description: '',
      monthlyAmount: 0,
      isRecurring: true
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-primary">Budget Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Jackpot Investment & Expense Planning</p>
        </div>
        <Badge variant={totalAllocation === 100 ? "default" : "destructive"} className="px-3 py-1">
          <Calculator className="h-4 w-4 mr-2" />
          {totalAllocation}% Allocated
        </Badge>
      </div>

      {/* Jackpot Input */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center">
            <Banknote className="w-5 h-5 mr-2" />
            Jackpot Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jackpot-eur">Jackpot (EUR)</Label>
              <Input
                id="jackpot-eur"
                type="text"
                value={jackpotAmount}
                onChange={(e) => setJackpotAmount(e.target.value)}
                className="font-mono"
                placeholder="74000000"
              />
            </div>
            <div>
              <Label htmlFor="interest-rate">Fixed Deposit Rate (%)</Label>
              <Input
                id="interest-rate"
                type="text"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="font-mono"
                placeholder="10.5"
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gold/10 to-yellow-500/10 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary dark:text-primary">
                  €{jackpotEUR.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Jackpot EUR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold">
                  R{jackpotZAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Jackpot ZAR (Rate: {exchangeRate?.rate.toFixed(2) || '20.71'})
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories with Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
            {/* Fixed Deposit Card */}
            <Card className="data-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Fixed Deposit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="investec-percent" className="text-sm">Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="investec-percent"
                      type="number"
                      value={allocation.investecFixedDeposit}
                      onChange={(e) => handleAllocationChange('investecFixedDeposit', e.target.value)}
                      className="font-mono"
                      min="0"
                      max="100"
                    />
                    <span className="text-slate-500 dark:text-slate-400">%</span>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    R{investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {allocation.investecFixedDeposit}% of jackpot
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Account Card */}
            <Card className="data-card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Main Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                    R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Net monthly income
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Houses/Property Card */}
            <Card className="data-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Houses/Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="houses-percent" className="text-sm">Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="houses-percent"
                      type="number"
                      value={allocation.houses}
                      onChange={(e) => handleAllocationChange('houses', e.target.value)}
                      className="font-mono"
                      min="0"
                      max="100"
                    />
                    <span className="text-slate-500 dark:text-slate-400">%</span>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    R{housesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {allocation.houses}% of jackpot
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cars/Vehicles Card */}
            <Card className="data-card bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Cars/Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="cars-percent" className="text-sm">Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="cars-percent"
                      type="number"
                      value={allocation.cars}
                      onChange={(e) => handleAllocationChange('cars', e.target.value)}
                      className="font-mono"
                      min="0"
                      max="100"
                    />
                    <span className="text-slate-500 dark:text-slate-400">%</span>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    R{carsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {allocation.cars}% of jackpot
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Expenses Card */}
            <Card className="data-card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Other Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="other-percent" className="text-sm">Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="other-percent"
                      type="number"
                      value={allocation.otherExpenses}
                      onChange={(e) => handleAllocationChange('otherExpenses', e.target.value)}
                      className="font-mono"
                      min="0"
                      max="100"
                    />
                    <span className="text-slate-500 dark:text-slate-400">%</span>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    R{otherAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {allocation.otherExpenses}% of jackpot
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="property" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Property Investments</h3>
            <Button onClick={addProperty} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>
          
          <div className="grid gap-6">
            {properties.length === 0 ? (
              <Card className="data-card">
                <CardContent className="p-8 text-center">
                  <Home className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No properties added yet</p>
                  <Button onClick={addProperty}>Add Your First Property</Button>
                </CardContent>
              </Card>
            ) : (
              properties.map((property) => (
                <Card key={property.id} className="data-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Property Details
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProperties(prev => prev.filter(p => p.id !== property.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Property Type</Label>
                      <Select
                        value={property.type}
                        onValueChange={(value) => 
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {...p, type: value} : p
                          ))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="farm">Farm</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g., Cape Town, Sandton"
                        value={property.location}
                        onChange={(e) => 
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {...p, location: e.target.value} : p
                          ))
                        }
                      />
                    </div>

                    <div>
                      <Label>Purchase Price (R)</Label>
                      <Input
                        type="number"
                        placeholder="2500000"
                        value={property.price || ''}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {
                              ...p, 
                              price,
                              insurance: estimatePropertyInsurance(property.type, price, property.location),
                              monthlyRates: estimatePropertyRates(price, property.location)
                            } : p
                          ));
                        }}
                      />
                    </div>

                    <div>
                      <Label>Estimated Insurance (Monthly)</Label>
                      <Input
                        type="number"
                        value={property.insurance || ''}
                        onChange={(e) => 
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {...p, insurance: parseFloat(e.target.value) || 0} : p
                          ))
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Estimated: R{estimatePropertyInsurance(property.type, property.price, property.location).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <Label>Municipal Rates (Monthly)</Label>
                      <Input
                        type="number"
                        value={property.monthlyRates || ''}
                        onChange={(e) => 
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {...p, monthlyRates: parseFloat(e.target.value) || 0} : p
                          ))
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Estimated: R{estimatePropertyRates(property.price, property.location).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <Label>Transfer Costs</Label>
                      <Input
                        type="number"
                        placeholder="Transfer duties, legal fees"
                        value={property.transferCosts || ''}
                        onChange={(e) => 
                          setProperties(prev => prev.map(p => 
                            p.id === property.id ? {...p, transferCosts: parseFloat(e.target.value) || 0} : p
                          ))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Vehicle Purchases</h3>
            <Button onClick={addVehicle} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </div>
          
          <div className="grid gap-6">
            {vehicles.length === 0 ? (
              <Card className="data-card">
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No vehicles added yet</p>
                  <Button onClick={addVehicle}>Add Your First Vehicle</Button>
                </CardContent>
              </Card>
            ) : (
              vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="data-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Vehicle Details
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVehicles(prev => prev.filter(v => v.id !== vehicle.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Make</Label>
                      <Input
                        placeholder="e.g., BMW, Mercedes"
                        value={vehicle.make}
                        onChange={(e) => 
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {...v, make: e.target.value} : v
                          ))
                        }
                      />
                    </div>

                    <div>
                      <Label>Model</Label>
                      <Input
                        placeholder="e.g., X5, C-Class"
                        value={vehicle.model}
                        onChange={(e) => 
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {...v, model: e.target.value} : v
                          ))
                        }
                      />
                    </div>

                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        min="2000"
                        max={new Date().getFullYear() + 1}
                        value={vehicle.year || ''}
                        onChange={(e) => 
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {...v, year: parseInt(e.target.value) || new Date().getFullYear()} : v
                          ))
                        }
                      />
                    </div>

                    <div>
                      <Label>Purchase Price (R)</Label>
                      <Input
                        type="number"
                        placeholder="850000"
                        value={vehicle.price || ''}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {
                              ...v, 
                              price,
                              insurance: estimateCarInsurance(vehicle.make, vehicle.model, vehicle.year, price),
                              maintenance: estimateCarMaintenance(vehicle.make, vehicle.year, price)
                            } : v
                          ));
                        }}
                      />
                    </div>

                    <div>
                      <Label>Insurance (Monthly)</Label>
                      <Input
                        type="number"
                        value={vehicle.insurance || ''}
                        onChange={(e) => 
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {...v, insurance: parseFloat(e.target.value) || 0} : v
                          ))
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Estimated: R{estimateCarInsurance(vehicle.make, vehicle.model, vehicle.year, vehicle.price).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <Label>Maintenance (Monthly)</Label>
                      <Input
                        type="number"
                        value={vehicle.maintenance || ''}
                        onChange={(e) => 
                          setVehicles(prev => prev.map(v => 
                            v.id === vehicle.id ? {...v, maintenance: parseFloat(e.target.value) || 0} : v
                          ))
                        }
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Estimated: R{estimateCarMaintenance(vehicle.make, vehicle.year, vehicle.price).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Other Expenses</h3>
            <Button onClick={addExpense} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
          
          <div className="grid gap-6">
            {expenses.length === 0 ? (
              <Card className="data-card">
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No expenses added yet</p>
                  <Button onClick={addExpense}>Add Your First Expense</Button>
                </CardContent>
              </Card>
            ) : (
              expenses.map((expense) => (
                <Card key={expense.id} className="data-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Expense Details
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpenses(prev => prev.filter(e => e.id !== expense.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={expense.category}
                        onValueChange={(value) => 
                          setExpenses(prev => prev.map(e => 
                            e.id === expense.id ? {...e, category: value} : e
                          ))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="travel">Travel & Holidays</SelectItem>
                          <SelectItem value="charity">Charity & Donations</SelectItem>
                          <SelectItem value="family">Family Support</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle & Entertainment</SelectItem>
                          <SelectItem value="business">Business Investment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Describe the expense"
                        value={expense.description}
                        onChange={(e) => 
                          setExpenses(prev => prev.map(exp => 
                            exp.id === expense.id ? {...exp, description: e.target.value} : exp
                          ))
                        }
                      />
                    </div>

                    <div>
                      <Label>Monthly Amount (R)</Label>
                      <Input
                        type="number"
                        placeholder="15000"
                        value={expense.monthlyAmount || ''}
                        onChange={(e) => 
                          setExpenses(prev => prev.map(exp => 
                            exp.id === expense.id ? {...exp, monthlyAmount: parseFloat(e.target.value) || 0} : exp
                          ))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="data-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Main Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Account Type</Label>
                    <Input placeholder="e.g., Main spending account" />
                  </div>
                  <div>
                    <Label>Bank</Label>
                    <Input placeholder="e.g., Investec Private Banking" />
                  </div>
                  <div>
                    <Label>Account Holder</Label>
                    <Input placeholder="Full name" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg p-6">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-4">Monthly Income Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Gross Monthly Interest:</span>
                      <span className="font-semibold">R{taxCalc.monthlyInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Monthly Tax:</span>
                      <span className="font-semibold text-red-600">-R{(taxCalc.taxOwed / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Net Monthly Income:</span>
                      <span className="font-bold text-indigo-600 text-lg">R{taxCalc.netMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Net Income:</span>
                      <span className="font-semibold">R{(taxCalc.netMonthlyIncome * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Allocation Summary */}
      <Card className="data-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary dark:text-primary flex items-center justify-between">
            <span className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Allocation Summary
            </span>
            <Badge variant={totalAllocation === 100 ? "default" : "destructive"} className="px-3 py-1">
              {totalAllocation}% Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Allocation:</span>
              <span className={totalAllocation === 100 ? "text-green-600" : "text-red-600"}>
                {totalAllocation}%
              </span>
            </div>
            {totalAllocation !== 100 && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Allocation must total 100%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}