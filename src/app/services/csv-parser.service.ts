import { Injectable } from '@angular/core';
import * as CsvParser from 'csv-parse';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  constructor() { }

  public parseCsv(file, cb): void {
    CsvParser(file, {
      delimiter: ';'
    } as any, (error, data) => {
      if (data.find((oneItem) => {
        return oneItem.length > 1;
      }) || error) {
        cb({error, data});
      } else {
        CsvParser(file, {
          delimiter: ';'
        } as any, (error2, data2) => {
          cb({error2, data2});
        });
      }
    });
  }


}
