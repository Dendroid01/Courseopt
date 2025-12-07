import { useState, useMemo } from "react";

export default function SortableTable({ data, columns, onRowClick, filters = {} }) {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeFilters, setActiveFilters] = useState(filters);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return item[key] === value;
      });
    });
  }, [data, activeFilters]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="overflow-x-auto">
      {}
      <div className="flex gap-4 mb-2">
        {Object.keys(filters).map(key => (
          <select
            key={key}
            value={activeFilters[key]}
            onChange={e => handleFilterChange(key, e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Все {key}</option>
            {[...new Set(data.map(d => d[key]))].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}
      </div>

      {}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            {columns.map(col => (
              <th
                key={col.accessor}
                onClick={() => handleSort(col.accessor)}
                className="py-2 px-4 border cursor-pointer"
              >
                {col.label} {sortField === col.accessor ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(row => (
            <tr
              key={row.id || row.inn}
              className="text-center hover:bg-gray-100 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map(col => (
                <td key={col.accessor} className="py-2 px-4 border">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
