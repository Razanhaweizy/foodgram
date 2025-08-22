import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <Layout>
      <Card className="max-w-md mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold text-center">Welcome to Foodgram 🍲</h1>
          <Input placeholder="Search recipes..." />
          <Button className="w-full">Search</Button>
        </CardContent>
      </Card>
    </Layout>
  )
}
