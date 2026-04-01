import React from 'react';
import { academicApi } from '../../api/academicApi';
import SimpleCrudWaliPage from './SimpleCrudWaliPage';
export default function KebersihanPage(){return <SimpleCrudWaliPage title="Kebersihan Kelas" subtitle="Monitoring area, status, dan catatan kebersihan kelas" fetcher={academicApi.getKebersihan} creator={academicApi.createKebersihan} fields={[{name:'area',label:'Area'},{name:'status',label:'Status'},{name:'catatan',label:'Catatan'}]} columns={[{key:'no',label:'No',render:(_,i)=>i+1},{key:'area',label:'Area'},{key:'status',label:'Status'},{key:'catatan',label:'Catatan'},{key:'tanggal',label:'Tanggal'}]} />}
