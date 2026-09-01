import { users } from "../../../lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function MySkillsPage() {
  const currentUser = users[0]; // Ramesh

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Skills</h1>
          <p className="text-foreground-secondary mt-1">Manage the skills you want to teach and learn.</p>
        </div>
        <Button variant="primary">Add Skill</Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Skills I Can Teach</CardTitle>
            <CardDescription>What you are offering to the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {currentUser.offers.map(skill => (
                <li key={skill} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                  <span className="font-medium text-foreground">{skill}</span>
                  <Button variant="ghost" size="small" className="text-error hover:text-error hover:bg-error-soft">Remove</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2">Skills I Want to Learn</CardTitle>
            <CardDescription>What you are looking for in an exchange.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {currentUser.needs.map(skill => (
                <li key={skill} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                  <span className="font-medium text-foreground">{skill}</span>
                  <Button variant="ghost" size="small" className="text-error hover:text-error hover:bg-error-soft">Remove</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
