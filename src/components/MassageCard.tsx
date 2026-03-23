import React from 'react';
import { Star, MapPin, ExternalLink, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { MassagePlace } from '../services/massageService';

interface MassageCardProps {
  place: MassagePlace;
}

export const MassageCard: React.FC<MassageCardProps> = ({ place }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8e4d9] hover:shadow-md transition-shadow group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="serif text-2xl font-medium text-[#4a4a3a] group-hover:text-[#5a5a40] transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-[#8a8a7a]">
            <MapPin size={14} />
            <span>{place.address}</span>
          </div>
        </div>
        {place.rating && (
          <div className="flex items-center gap-1 bg-[#f5f5f0] px-3 py-1 rounded-full">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{place.rating}</span>
            {place.userRatingsTotal && (
              <span className="text-xs text-[#8a8a7a]">({place.userRatingsTotal})</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {place.types.slice(0, 3).map((type) => (
          <span
            key={type}
            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-[#f0f0eb] rounded-md text-[#6a6a5a]"
          >
            {type.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {place.snippets && place.snippets.length > 0 && (
        <div className="mb-6 space-y-2">
          {place.snippets.slice(0, 2).map((snippet, idx) => (
            <div key={idx} className="flex gap-2 items-start italic text-sm text-[#6a6a5a]">
              <Quote size={12} className="mt-1 opacity-50 shrink-0" />
              <p className="line-clamp-2">"{snippet}"</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <a
          href={place.mapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#5a5a40] text-white py-3 rounded-2xl text-sm font-medium hover:bg-[#4a4a3a] transition-colors"
        >
          View on Maps
          <ExternalLink size={14} />
        </a>
        <button className="flex-1 border border-[#5a5a40] text-[#5a5a40] py-3 rounded-2xl text-sm font-medium hover:bg-[#f5f5f0] transition-colors">
          Book Service
        </button>
      </div>
    </motion.div>
  );
};
