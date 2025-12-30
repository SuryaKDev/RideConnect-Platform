import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getTransactionHistory } from "@/lib/api";
import { motion } from "framer-motion";

interface Transaction {
  id: number;
  transactionId: string;
  date: string;
  amount: number;
  status: string;
  description?: string;
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactionHistory();
      setTransactions(data);
    } catch (error: any) {
      toast({
        title: "Error Loading Transactions",
        description: error.response?.data?.message || "Could not fetch transaction history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">
            <CheckCircle className="w-3 h-3 mr-1" /> Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-none">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/passenger-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Receipt className="w-8 h-8 text-primary" />
                Transaction History
              </h1>
              <p className="text-muted-foreground">
                View all your payment transactions
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">All Transactions</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted/20" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                <p className="text-muted-foreground">
                  Your payment history will appear here once you make a booking.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                      <TableHead className="text-muted-foreground">Description</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} className="border-border hover:bg-white/5">
                        <TableCell className="font-medium">{formatDate(txn.date)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{txn.transactionId}</TableCell>
                        <TableCell>{txn.description || "Ride Booking"}</TableCell>
                        <TableCell className="font-semibold text-accent">{formatCurrency(txn.amount)}</TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {!isLoading && transactions.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="glass-card p-6 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
              <div className="glass-card p-6 rounded-xl">
                <div className="text-2xl font-bold text-green-500">
                  {transactions.filter((t) => t.status === "SUCCESS").length}
                </div>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="glass-card p-6 rounded-xl">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === "SUCCESS")
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionHistory;
