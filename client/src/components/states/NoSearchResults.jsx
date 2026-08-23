import { SearchX } from 'lucide-react';
import EmptyState from './EmptyState';

const NoSearchResults = ({ query = "" }) => {
  return (
    <EmptyState 
      icon={SearchX}
      title="No Results Found"
      message={query ? `We couldn't find anything matching "${query}". Try adjusting your search terms or filters.` : "We couldn't find any results for your search."}
      actionText="Clear Search"
      actionLink="/products"
    />
  );
};

export default NoSearchResults;
