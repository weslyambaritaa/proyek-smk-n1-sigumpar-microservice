import React from 'react';
import { academicApi } from '../../api/academicApi';
import SimpleCrudWaliPage from './SimpleCrudWaliPage';
export default function ParentingPage(){return <SimpleCrudWaliPage title="Parenting" subtitle="Catatan komunikasi wali kelas dengan orang tua" fetcher={academicApi.getParenting} creator={academicApi.createParenting} fields={[{name:'siswa_nama',label:'Nama Siswa'},{name:'topik',label:'Topik'},{name:'catatan',label:'Catatan'}]} columns={[{key:'no',label:'No',render:(_,i)=>i+1},{key:'siswa_nama',label:'Nama Siswa'},{key:'topik',label:'Topik'},{key:'catatan',label:'Catatan'},{key:'tanggal',label:'Tanggal'}]} />}
