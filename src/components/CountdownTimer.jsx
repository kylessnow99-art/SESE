"use client";

const CountdownTimer = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return (
    <div className="text-right">
      <div className="text-xs text-gray-400">Round ends in</div>
      <div className="font-mono text-xl font-bold bg-gradient-to-r from-[#9945ff] to-[#14f195] bg-clip-text text-transparent">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
    </div>
  );
};

export default CountdownTimer;
