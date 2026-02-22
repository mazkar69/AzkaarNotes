import { useState, useRef, useEffect } from "react";
import countriesData from '../../assets/countriesFull.json';            //Using restcountries.com to fetch the country data.

export default function CountrySelect({ countryCode, setCountryCode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const dropdownRef = useRef(null);

  // Initialize with India as default or find country by code
  useEffect(() => {
    if (countryCode) {
      const country = countriesData.find(c => {
        const code = c.idd.root + (c.idd.suffixes?.[0] || "");
        return code === countryCode;
      });
      if (country) {
        const code = country.idd.root + (country.idd.suffixes?.[0] || "");
        setSelectedCountry({
          name: country.name.common,
          flag: country.flags.png,
          code: code
        });
      }
    } else {
      // Default to India
      const india = countriesData.find(c => c.cca2 === "IN");
      if (india) {
        const code = india.idd.root + (india.idd.suffixes?.[0] || "");
        setSelectedCountry({
          name: india.name.common,
          flag: india.flags.png,
          code: code
        });
        setCountryCode(code);
      }
    }
  }, [countryCode, setCountryCode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    const code = country.idd.root + (country.idd.suffixes?.[0] || "");
    setSelectedCountry({
      name: country.name.common,
      flag: country.flags.png,
      code: code
    });
    setCountryCode(code);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const filteredCountries = countriesData.filter(country => {
    const searchText = `${country.name.common} ${country.altSpellings?.join(" ") || ""} ${country.idd.root}${country.idd.suffixes?.[0] || ""}`;
    return searchText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-3 border border-blue-gray-200 rounded-lg cursor-pointer hover:border-blue-gray-400 transition-colors bg-white min-w-[100px]"
      >
        {selectedCountry ? (
          <>
            <img 
              src={selectedCountry.flag} 
              alt={selectedCountry.name}
              className="w-6 h-4 object-cover rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedCountry.code}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500">Select</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-80">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const code = country.idd.root + (country.idd.suffixes?.[0] || "");
                return (
                  <div
                    key={country.cca2}
                    onClick={() => handleCountrySelect(country)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedCountry?.code === code ? 'bg-blue-50' : ''
                    }`}
                  >
                    <img 
                      src={country.flags.png} 
                      alt={country.name.common}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span className="flex-1 text-sm text-gray-700">
                      {country.name.common}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {code}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
