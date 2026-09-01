import Link from "next/link";
import { users } from "../../../lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Avatar } from "../../../components/ui/avatar";
import { Rating } from "../../../components/ui/rating";
import { Badge } from "../../../components/ui/badge";

export default function DiscoverPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Skills</h1>
            <p className="text-foreground-secondary mt-2">Find members who can teach what you want to learn.</p>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <Input placeholder="Search skills..." aria-label="Search skills" className="max-w-sm" />
            <Button variant="primary">Search</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <Card key={user.id} className="flex flex-col hover:border-border-strong transition-colors">
              <CardHeader className="flex flex-row gap-4 items-center pb-4">
                <Avatar src={user.avatar} alt={user.name} size="md" />
                <div className="flex flex-col">
                  <CardTitle as="h2" className="text-lg">{user.name}</CardTitle>
                  <span className="text-sm text-foreground-secondary">{user.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Can Teach</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.offers.map(skill => (
                      <Badge key={skill} variant="brand">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Wants to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.needs.map(skill => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <Rating value={user.rating} count={user.reviewCount} />
                <Button as={Link} href={`/profile/${user.id}`} variant="outline" size="small">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
