import React, { useEffect, useState } from 'react';
import { vocationalApi } from '../../api/vocationalApi';
import { Field, PageHeader, Panel, SimpleTable, inputClass, primaryButton } from '../../components/role/RolePage';
export default function LokasiPklPage(){
 const [items,setItems]=useState([]); const [form,setForm]=useState({nama_siswa:'',nama_perusahaan:'',alamat:'',posisi:'',deskripsi:'',pembimbing_industri:'',kontak_pembimbing:'',tanggal:''});
 const load=async()=>{try{const res=await vocationalApi.getLokasiPkl();setItems(res.data.data||[]);}catch{setItems([])}}; useEffect(()=>{load()},[]);
 const submit=async(e)=>{e.preventDefault(); const fd=new FormData(); Object.entries(form).forEach(([k,v])=>fd.append(k,v)); await vocationalApi.createLokasiPkl(fd); setForm({nama_siswa:'',nama_perusahaan:'',alamat:'',posisi:'',deskripsi:'',pembimbing_industri:'',kontak_pembimbing:'',tanggal:''}); load();};
 return <div className="max-w-6xl mx-auto space-y-6"><PageHeader title="Pelaporan Detail Penempatan PKL" subtitle="Guru vokasi: input lokasi dan pekerjaan siswa" /><Panel title="Informasi Lokasi & Pekerjaan"><form onSubmit={submit} className="grid md:grid-cols-4 gap-4 items-end">{Object.keys(form).map(k=><Field key={k} label={k.replaceAll('_',' ')}><input className={inputClass} value={form[k]} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} /></Field>)}<button className={primaryButton}>Simpan Laporan</button></form></Panel><Panel title="Daftar Penempatan & Tugas PKL"><SimpleTable data={items} columns={[{key:'no',label:'No',render:(_,i)=>i+1},{key:'nama_siswa',label:'Siswa'},{key:'nama_perusahaan',label:'Perusahaan'},{key:'posisi',label:'Judul & Deskripsi'},{key:'pembimbing_industri',label:'Pembimbing'},{key:'tanggal',label:'Tanggal'}]} /></Panel></div>
}
