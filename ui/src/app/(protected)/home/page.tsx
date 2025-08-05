import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="h-full w-full grid place-content-center ">
      <Card className="w-full max-w-sm px-4 py-8">
        <CardHeader>
          <CardTitle>
            Welcome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={"/home/projects/create"}>
          <div className="flex flex-row gap-0.5 border rounded py-2 px-4">
            <PlusSquare className="grow-0" />
            <h2 className="grow">Create Project</h2>
          </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
