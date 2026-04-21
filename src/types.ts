/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LetterStatus = 'selesai' | 'berproses' | 'belum';

export interface Stage {
  label: string;
  status: LetterStatus;
  date?: string;
}

export interface LetterData {
  id: string;
  no: number;
  uraian: string;
  kategori: string;
  layanan: string;
  stages: Stage[];
}
