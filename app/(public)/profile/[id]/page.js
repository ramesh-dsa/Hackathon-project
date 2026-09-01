import { users } from "../../../../lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import { Rating } from "../../../../components/ui/rating";

export default async function ProfilePage({ params }) {
  // In a real app, we would await params.id and fetch from DB
  const { id } = await params;
  const user = users.find(u => u.id === id) || users[0];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar src={user.avatar} alt={user.name} size="lg" className="mb-4 w-32 h-32" />
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {user.name}
                {user.verified && (
                  <Badge variant="success" className="px-1.5 py-0">Verified</Badge>
                )}
              </h1>
              <p className="text-foreground-secondary mt-1 text-sm">{user.location}</p>
              
              <div className="flex justify-center mt-4">
                <Rating value={user.rating} count={user.reviewCount} />
              </div>
              
              <p className="text-foreground mt-4 text-sm leading-relaxed">{user.bio}</p>
              
              <Button className="w-full mt-6" variant="primary">Request Exchange</Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Skills to Teach</CardTitle>
              <CardDescription>What {user.name.split(' ')[0]} can offer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.offers.map(skill => (
                  <Badge key={skill} variant="brand" className="px-3 py-1.5 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Skills to Learn</CardTitle>
              <CardDescription>What {user.name.split(' ')[0]} is looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.needs.map(skill => (
                  <Badge key={skill} variant="default" className="px-3 py-1.5 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
