import { of, timer, Observable, from, throwError } from 'rxjs'; 
import { 
  map,
  takeWhile,
  catchError,
  concatMap,
  tap,
  finalize,
   } from 'rxjs/operators';

interface Data {
  id: number | string;
  status?: string;
}

let data :Data[] = [
  {id: 1},
  {id: 2},
  {id: 3},
  {id: 4}
];

const LIMIT_QUERY = 10;

function backend(dataItems, limitQuery: number): Observable<Data> {
  console.log('This is data from backend', dataItems);

  if(!dataItems.length) {
    return dataItems;
  }

  let randStatus: number;
  let randomError = Math.round(1 + Math.random() * (3));

  if(randomError == 1) {
    return throwError(new Error('some request error!'));
  }

  return from(dataItems).pipe(
    map( (item: Data): Data  => {
      randStatus = Math.round(Math.random());
      return randStatus ? {id: item.id, status: 'proccesing'} : {id: item.id, status: 'done'}
    }),

  )
}

function frontend(){
  let limitQuery = 0;
  let exit = false;

  let poll$ = timer(0, 2000).pipe(
    takeWhile(() => (!exit && data.length > 0)),
    tap(query => console.log("Query", query)),
    concatMap(() => backend(data, limitQuery++)),
    finalize(() => console.log('should stop'))
  );

  poll$.subscribe( (items: Data) => {

    if(data.length) {
      data.map(obj => {
        obj.status = obj.id === items.id ? items.status : '';
      })
      data = data.filter(item => item.status !== 'done');
      console.log('This is data', items)
    }

    if(limitQuery > LIMIT_QUERY) {
      exit = true;
      console.log(`Error number of requests for more than ${LIMIT_QUERY}`)
    }
  },
  err => {
    console.error(err);
  });
  console.log('This is limit', limitQuery)
}

frontend();
