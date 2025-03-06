import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ResponseViewer from "@/components/responseViewer";

const InfiniteResponsesScroller = ({ responses }: { responses: any[] }) => {
  // Add null/undefined check
  if (!responses || responses.length === 0) {
    return null; // Or return an empty div if you prefer
  }

  return (
    <div className="space-y-6">
      {responses.map((response) => (
        <div
          key={response.id}
          className="border-2 rounded-lg p-5 bg-card text-card-foreground"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary">
              <User size={16} />
            </div>
            <div className="text-sm flex items-center gap-2">
              <span className="font-medium text-foreground">
                {response.author}
              </span>
              <span className="text-muted-foreground text-xs">
                •{" "}
                {formatDistanceToNow(new Date(response.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <ResponseViewer responseContent={response.content} />
        </div>
      ))}
    </div>
  );
};

export default InfiniteResponsesScroller;