import React from 'react'

const Skaliton = () => {
  return (
    <>
      <div className="min-h-screen bg-base-200 py-8">
        <div className="max-w-xl mx-auto px-4">
          {/* Stories Skeleton */}
          <div className="card bg-base-100 mb-4">
            <div className="card-body p-4">
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="skeleton w-16 h-16 rounded-full" />
                    <div className="skeleton w-12 h-2 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Post Skeletons */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="card bg-base-100 mb-4">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton w-32 h-3 rounded mb-2" />
                    <div className="skeleton w-24 h-2 rounded" />
                  </div>
                  <div className="skeleton w-6 h-6 rounded" />
                </div>

                {/* Image */}
                <div className="skeleton w-full aspect-square rounded-lg mt-4" />

                {/* Actions */}
                <div className="mt-4">
                  <div className="flex gap-4 mb-3">
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="skeleton w-6 h-6 rounded" />
                    <div className="skeleton w-6 h-6 rounded ml-auto" />
                  </div>

                  {/* Likes */}
                  <div className="skeleton w-28 h-3 rounded mb-2" />

                  {/* Caption */}
                  <div className="space-y-2">
                    <div className="skeleton w-full h-3 rounded" />
                    <div className="skeleton w-4/5 h-3 rounded" />
                  </div>

                  {/* Comments */}
                  <div className="skeleton w-36 h-2 rounded mt-3" />
                  <div className="skeleton w-20 h-2 rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </>
  )
}

export default Skaliton