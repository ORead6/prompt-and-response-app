"use client";

import React from "react";
import { motion } from "framer-motion";
import ThemeSwitch from "@/components/ui/themeSwitch";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <ThemeSwitch />
      <motion.div
        className="text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Creative Writing Prompt & Response App
        </motion.h1>

        <motion.h2
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Made by Owen Read
        </motion.h2>
      </motion.div>
    </div>
  );
};

export default LandingPage;
