import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const NoPromptsCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-dashed p-8 text-center"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-muted p-6">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">No prompts found</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default NoPromptsCard;
