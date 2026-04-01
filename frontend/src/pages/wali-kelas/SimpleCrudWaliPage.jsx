import React, { useEffect, useState } from 'react';
import { Field, PageHeader, Panel, SimpleTable, inputClass, primaryButton } from '../../components/role/RolePage';
export default function SimpleCrudWaliPage({ title, subtitle, fields, fetcher, creator, columns }){
 const [items,setItems]=useState([]); const [form,setForm]=useState(Object.fromEntries(fields.map(f=>[f.name,''])));
 const load=async()=>{ try{ const res=await fetcher(); setItems(res.data.data || res.data || []);}catch{ setItems([]);} };
 useEffect(()=>{load()},[]);
 const submit=async(e)=>{ e.preventDefault(); await creator(form); setForm(Object.fromEntries(fields.map(f=>[f.name,'']))); load(); };
 return <div className="max-w-6xl mx-auto space-y-6"><PageHeader title={title} subtitle={subtitle} /><Panel><form onSubmit={submit} className="grid md:grid-cols-3 gap-4 items-end">{fields.map(f=><Field key={f.name} label={f.label}><input className={inputClass} value={form[f.name]} onChange={e=>setForm(v=>({...v,[f.name]:e.target.value}))} /></Field>)}<button className={primaryButton}>Simpan</button></form></Panel><Panel title={`Daftar ${title}`}><SimpleTable data={items} columns={columns} /></Panel></div>
}
