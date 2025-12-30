import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getTransactionHistory } from "@/lib/api";

interface Transaction {
  id: string;
  transactionId: string;
  date: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
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
        title: "Failed to Load Transactions",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-accent/20 text-accent border-accent/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
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
      minimumFractionDigits: 2,
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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Transaction History</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl gradient-text">Payment Records</CardTitle>
            <CardDescription>
              View all your payment transactions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
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
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                      <TableHead className="text-muted-foreground text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-border/50 hover:bg-secondary/30"
                      >
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span
                            className={
                              transaction.status === "SUCCESS"
                                ? "text-primary"
                                : transaction.status === "FAILED"
                                ? "text-destructive"
                                : "text-accent"
                            }
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {!isLoading && transactions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-primary">
                  {transactions.filter((t) => t.status === "SUCCESS").length}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    transactions
                      .filter((t) => t.status === "SUCCESS")
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default TransactionHistory;
