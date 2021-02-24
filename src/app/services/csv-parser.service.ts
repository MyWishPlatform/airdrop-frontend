import { Injectable } from '@angular/core';
import * as CsvParser from 'csv-parse';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  constructor() { }

  public parseCsv(file, cb): void {
    CsvParser(file, (error, data) => {
      cb({error, data});
    });
  }


}
