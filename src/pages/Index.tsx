
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Box, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Inventory",
    value: "12,345",
    change: "+4.75%",
    icon: Box,
  },
  {
    name: "Low Stock Items",
    value: "23",
    change: "-12%",
    icon: TrendingUp,
  },
  {
    name: "Monthly Revenue",
    value: "$45,231",
    change: "+20.1%",
    icon: DollarSign,
  },
  {
    name: "Active Orders",
    value: "56",
    change: "+8%",
    icon: BarChart3,
  },
];

export default function Index() {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={
                        stat.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart will be implemented in next iteration
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 text-sm p-3 rounded-lg bg-muted/50"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">New order received</p>
                        <p className="text-muted-foreground">
                          Order #{Math.floor(Math.random() * 1000000)}
                        </p>
                      </div>
                      <time className="text-muted-foreground">2m ago</time>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
