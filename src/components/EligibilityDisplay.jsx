"use client";

const EligibilityDisplay = ({ amount, onConfirm, processing, failed, onRetry, countdown }) => {
  return (
    <div className="text-center">
      {/* Success Animation */}
      <div className="relative mb-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <div className="absolute inset-0 animate-pulse-glow rounded-full"></div>
      </div>
      
      <h3 className="text-2xl font-bold mb-1">Congratulations!</h3>
      <p className="text-gray-300 mb-4">You've been selected for the Community Rewards Round</p>
      
      {/* Amount Display */}
      <div className="text-5xl font-bold bg-gradient-to-r from-[#9945ff] to-[#14f195] bg-clip-text text-transparent animate-pulse-glow mb-4">
        {amount?.toFixed(2)} SOL
      </div>
      
      {/* Action Button */}
      {!failed ? (
        <button
          onClick={onConfirm}
          disabled={processing}
          className="glow-button w-full text-lg py-4 mb-4 relative overflow-hidden"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            'Initialize On-Chain Allocation →'
          )}
        </button>
      ) : (
        <div className="mb-4">
          <div className="text-red-400 mb-2">⚠️ Claim Process Cancelled</div>
          <button
            onClick={onRetry}
            className="glow-button w-full"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Info */}
      <div className="text-sm text-gray-400 space-y-1">
        <p>• Allocation expires in {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}</p>
        <p>• Gas fees covered by protocol</p>
      </div>
      
      {failed && (
        <p className="text-sm text-gray-400 mt-4">
          Please try again to complete your allocation.
        </p>
      )}
    </div>
  );
};

export default EligibilityDisplay;
