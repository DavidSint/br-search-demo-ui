import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BloomreachApiResponse } from '../types';
import './SearchResultsPage.css';

interface FetchSearchResultsParams {
  query: string;
  start: number;
  rows: number;
}

const fetchSearchResults = async ({ query, start, rows }: FetchSearchResultsParams): Promise<BloomreachApiResponse> => {
  const endpoint = `https://staging-core.dxpapi.com/api/v1/core/?fl=pid,title,introduction,url&_br_uid_2=1234567890&search_type=keyword&start=${start}&rows=${rows}&request_id=123456&account_id=${import.meta.env.VITE_ACCOUNT_ID}&domain_key=${import.meta.env.VITE_DOMAIN_KEY}&request_type=search&url=www.example.com&q=${encodeURIComponent(query.trim())}`

  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [data, setData] = useState<BloomreachApiResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numFound, setNumFound] = useState<number>(0);
  const defaultPageSize = 6;

  const pageNumberParam = searchParams.get('pageNumber');
  const pageSizeParam = searchParams.get('pageSize');

  const pageNumber = pageNumberParam ? parseInt(pageNumberParam, 10) : 1;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : defaultPageSize;

  const start = (pageNumber - 1) * pageSize;
  const rows = pageSize;

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      fetchSearchResults({ query, start, rows })
        .then((data) => {
          setData(data);
          setNumFound(data.response.numFound);
        })
        .catch(() => {
          setError('Failed to fetch search results. Please try again later.');
          setData(undefined);
          setNumFound(0);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No search query provided.');
    }
  }, [query, start, rows]);

  if (loading) {
    return <div className="results-container loading">Loading results for "{query}"...</div>;
  }

  if (error) {
    return <div className="results-container error-message">{error}</div>;
  }

  if (numFound === 0) {
    return (
      <div className="results-container no-results">
        <h2>No results found for "{query}"</h2>
        <p>Try searching for something else!</p>
      </div>
    );
  }

  if (data?.keywordRedirect?.['redirected url']) {
    return (
      <div className="results-container no-results">
        <h2>Redirect found for "{query}"!</h2>
        <p>If this were a real application, you would be redirected to {data.keywordRedirect['redirected url']}</p>
      </div>
    );
  }

  function handlePageChange(newPage: number) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('pageNumber', String(newPage));
    setSearchParams(newParams);
  }

  function handlePageSizeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newPageSize = parseInt(event.target.value, 10);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('pageSize', String(newPageSize));
    newParams.set('pageNumber', String(1)); // Reset to page 1 when page size changes
    setSearchParams(newParams);
  }

  const PageSelector = () => (<div className="page-size-selector">
    <label htmlFor="pageSize">Page Size:</label>
    <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
      <option value="5">3</option>
      <option value="10">10</option>
      <option value="25">30</option>
      <option value="50">50</option>
    </select>
  </div>)

  const Pagination = () => (<div className="pagination-controls">
    <button onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>Previous</button>
    <span>Page {pageNumber} of {Math.ceil(numFound / pageSize)}</span>
    <button onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= Math.ceil(numFound / pageSize)}>Next</button>
  </div>)

  return (
    <div className="results-container">
      <h1 className="results-title">
        {data?.autoCorrectQuery || data?.['relaxed.query'] ? `No results for "${query}" - searched for "${data.autoCorrectQuery || data['relaxed.query']}"` : `Search Results for "${query}"`}
      </h1>
      {data?.did_you_mean?.length && data?.did_you_mean?.length > 0 ?
        (<h2>
          Did you mean: {<a href={`/search-results?query=${data.did_you_mean[0]}`}>{data.did_you_mean[0]}</a>}
        </h2>)
        : ""}
      
      <div className='results-info'>
        <p className="results-count">{numFound} item{numFound !== 1 && 's'} found</p>
        <PageSelector />
      </div>

      
      <Pagination />

      <div className="results-grid">
        {data?.response.docs.map((doc) => (
          <div key={doc.pid} className="result-card">
            <h2 className="result-card-title">{doc.title}</h2>
            {/* Sanitizing HTML is important if it comes from an untrusted source.
                For this example, we assume the API provides safe HTML.
                In a real app, use a library like DOMPurify. */}
            <div
              className="result-card-intro"
              dangerouslySetInnerHTML={{ __html: doc.introduction }}
            />
            <a href={`https://www.example.com${doc.url}`} target="_blank" rel="noopener noreferrer" className="result-card-link">
              Read more
            </a>
          </div>
        ))}
      </div>

      <Pagination />
    </div>
  );
};

export default SearchResultsPage;
