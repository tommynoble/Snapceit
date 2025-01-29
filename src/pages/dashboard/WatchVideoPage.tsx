import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Info } from 'lucide-react';

export function WatchVideoPage() {
  const videos = [
    {
      title: "Getting Started with Snapceit",
      description: "Learn the basics of using Snapceit to scan and manage your receipts",
      duration: "5:30",
      thumbnail: "/videos/getting-started-thumb.jpg"
    },
    {
      title: "Schedule C Business Expenses",
      description: "How to categorize and track your business expenses for tax purposes",
      duration: "7:45",
      thumbnail: "/videos/schedule-c-thumb.jpg"
    },
    {
      title: "Receipt Organization Tips",
      description: "Best practices for organizing and managing your digital receipts",
      duration: "4:15",
      thumbnail: "/videos/organization-thumb.jpg"
    },
    {
      title: "Tax Saving Strategies",
      description: "Learn how to maximize your tax deductions with proper receipt management",
      duration: "6:20",
      thumbnail: "/videos/tax-savings-thumb.jpg"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tutorial Videos</h1>
          <p className="text-white/60 mt-1">Learn how to use Snapceit effectively</p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-2xl bg-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/15 transition-all duration-300"
          >
            <div className="aspect-video bg-black/20 relative">
              {/* Placeholder for video thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-white fill-current" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-sm">
                {video.duration}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{video.title}</h3>
              <p className="mt-1 text-sm text-white/60">{video.description}</p>
            </div>

            {/* Action buttons */}
            <div className="p-4 pt-0 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Transcript</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors">
                <Info className="h-4 w-4" />
                <span className="text-sm">Details</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
