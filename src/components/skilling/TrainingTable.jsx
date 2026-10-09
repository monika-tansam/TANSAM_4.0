import { useId, useMemo, useState } from 'react';
import { Search, RotateCcw, MoveHorizontal, SlidersHorizontal } from 'lucide-react';
import { filterTrainingRecords, sumParticipants } from '../../data/skillingTrainingData';

const number = new Intl.NumberFormat('en-IN');
// Participation totals follow the source's conventional thousands formatting.
const totalNumber = new Intl.NumberFormat('en-US');

export default function TrainingTable({ records, type }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [domain, setDomain] = useState('');
  const faculty = type === 'faculty';
  const heading = faculty ? 'Faculty training records' : 'Student training records';
  const years = [...new Set(records.map(row => row.year.slice(0, 9)))].sort().reverse();
  const filtered = useMemo(() => filterTrainingRecords(records, { query, year, domain }), [records, query, year, domain]);
  const publishedTotal = sumParticipants(records);
  const hasFilters = Boolean(query || year || domain);
  const reset = () => { setQuery(''); setYear(''); setDomain(''); };

  return <div className="sk-records">
    <div className="sk-records-top">
      <div><h3>{heading}</h3><p>Published course participation across academic years</p></div>
      <div className="sk-records-total"><strong>{totalNumber.format(publishedTotal)}</strong><span>{faculty ? 'Faculty' : 'Student'} participation · published total</span></div>
    </div>
    <div className="sk-table-filters" role="group" aria-label={`${heading} filters`}>
      <div className="sk-search"><label htmlFor={`${id}-search`}>Search {type} courses</label><div><Search size={17} aria-hidden="true" /><input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a course…" /></div></div>
      <div><label htmlFor={`${id}-year`}>Academic year</label><select id={`${id}-year`} value={year} onChange={event => setYear(event.target.value)}><option value="">All years</option>{years.map(value => <option key={value}>{value}</option>)}</select></div>
      <div><label htmlFor={`${id}-domain`}>Institution type</label><select id={`${id}-domain`} value={domain} onChange={event => setDomain(event.target.value)}><option value="">All types</option><option value="ENGINEERING">Engineering</option><option value="POLYTECHNIC">Polytechnic</option></select></div>
      <button type="button" className="sk-reset" disabled={!hasFilters} onClick={reset}><RotateCcw size={15} aria-hidden="true" />Reset filters</button>
    </div>
    <div className="sk-table-status" role="status" aria-live="polite"><span><SlidersHorizontal size={14} aria-hidden="true" />{filtered.length} of {records.length} courses{hasFilters ? ` · ${totalNumber.format(sumParticipants(filtered))} participation in this view` : ''}</span><span className="sk-scroll-hint"><MoveHorizontal size={16} aria-hidden="true" />Scroll to view all columns</span></div>
    <div className="sk-table-scroll" role="region" aria-label={`${heading} table`} tabIndex={0}>
      <table>
        <caption className="sk-sr-only">{heading}. Records published by TANSAM, collected October 2026. Counts may include repeat participants.</caption>
        <thead><tr><th scope="col">No.</th><th scope="col">Course</th><th scope="col">Institution type</th><th scope="col">Year / semester</th>{faculty && <th scope="col">Colleges</th>}<th scope="col">{faculty ? 'Faculty' : 'Students'}</th></tr></thead>
        <tbody>{filtered.map(row => <tr key={row.id} data-training-row={`${type}-${row.id}`}><td>{row.id}</td><th scope="row">{row.course}</th><td><span className="sk-domain">{row.domain === 'ENGINEERING' ? 'Engineering' : 'Polytechnic'}</span></td><td>{row.year.replace(/ODD SEM/i, 'Odd semester').replace(/EVEN SEM/i, 'Even semester')}</td>{faculty && <td>{number.format(row.collegeCount)}</td>}<td className="sk-count">{number.format(row.count)}</td></tr>)}</tbody>
      </table>
      {filtered.length === 0 && <div className="sk-empty"><Search size={27} aria-hidden="true" /><h4>No matching courses</h4><p>Try a different search, year, or institution type.</p><button type="button" className="sk-button sk-button--secondary" onClick={reset}>Clear filters</button></div>}
    </div>
    <p className="sk-records-note">Counts reflect course participation and may include repeat participants. {faculty ? 'College entries can repeat across courses and terms.' : 'They do not represent a count of unique students.'}</p>
  </div>;
}
