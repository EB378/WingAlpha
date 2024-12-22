"use client";

import { useState } from "react";
import axios from "axios";

// Define the expected shape of the API response
interface Company {
  name: string;
  businessId: string;
  website: string;
  address: string;
}

interface ApiResponse {
  results: Company[]; // Make sure this matches the actual API response
}

export default function Dashboard() {
  const [searchData, setSearchData] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null); // Initialize as null
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(
        "https://comprehensive-business-insights-for-finnish-companies.p.rapidapi.com/rapidapi/company/search",
        {
          qbid: searchData,
          qname: "",
          qperson: "",
          website: "",
          page: 1,
        },
        {
          headers: {
		'x-rapidapi-key': '4b8b130080msh1bed0677170608ap141974jsn3eb9e746fa46',
		'x-rapidapi-host': 'comprehensive-business-insights-for-finnish-companies.p.rapidapi.com',
		'Content-Type': 'application/json'
	},
        }
      );

      console.log("API Response:", response.data); // Debug the response
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-black text-white p-4 shadow-md">
        <h1 className="text-lg font-bold">Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Search Company Information
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Enter QBID"
              value={searchData}
              onChange={(e) => setSearchData(e.target.value)}
              className="w-full sm:w-auto flex-grow p-3 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading && (
            <p className="text-center text-gray-500 font-medium">
              Fetching data...
            </p>
          )}
          {result && result.results && result.results.length > 0 && ( // Add a check for `result.results`
            <div className="bg-white shadow-lg rounded-lg p-6 mt-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Search Results</h3>
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Company Name</th>
                    <th className="border border-gray-300 px-4 py-2">Business ID</th>
                    <th className="border border-gray-300 px-4 py-2">Website</th>
                    <th className="border border-gray-300 px-4 py-2">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((company: Company, index: number) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {company.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {company.businessId || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <a
                          href={company.website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {company.website || "N/A"}
                        </a>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {company.address || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result && (!result.results || result.results.length === 0) && ( // Handle no results
            <p className="text-center text-gray-500 mt-4">
              No results found.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-4 text-center shadow-inner">
        <p>&copy; 2024 Dashboard System</p>
      </footer>
    </div>
  );
}