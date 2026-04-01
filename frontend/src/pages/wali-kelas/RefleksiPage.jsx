import React from 'react';
import { academicApi } from '../../api/academicApi';
import SimpleCrudWaliPage from './SimpleCrudWaliPage';
export default function RefleksiPage(){return <SimpleCrudWaliPage title="Refleksi" subtitle="Catatan refleksi harian dan tindak lanjut wali kelas" fetcher={academicApi.getRefleksi} creator={academicApi.createRefleksi} fields={[{name:'judul',label:'Judul'},{name:'isi',label:'Isi Refleksi'},{name:'tanggal',label:'Tanggal'}]} columns={[{key:'no',label:'No',render:(_,i)=>i+1},{key:'judul',label:'Judul'},{key:'isi',label:'Isi'},{key:'tanggal',label:'Tanggal'}]} />}
