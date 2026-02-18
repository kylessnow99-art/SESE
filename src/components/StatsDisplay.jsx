"use client";

const StatsDisplay = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="glass-card p-6 text-center">
        <div className="text-2xl font-bold text-[#14f195]">
          {stats.distributed.toFixed(2)} SOL
        </div>
        <div className="text-sm text-gray-400">Distributed from pool</div>
      </div>
      
      <div className="glass-card p-6 text-center">
        <div className="text-2xl font-bold text-[#14f195]">
          {stats.participants.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">Participants</div>
      </div>
      
      <div className="glass-card p-6 text-center">
        <div className="text-2xl font-bold text-[#14f195]">
          {(stats.totalPool - stats.distributed).toFixed(2)} SOL
        </div>
        <div className="text-sm text-gray-400">Remaining</div>
      </div>
    </div>
  );
};

export default StatsDisplay;
