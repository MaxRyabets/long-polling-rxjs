import { of, timer, Observable, from, throwError } from "rxjs";
import {
  map,
  takeWhile,
  tap,
  finalize,
  delay,
  repeat,
  filter,
concatMap,
switchMap,
flatMap,
mergeMap
} from "rxjs/operators";

interface Item {
  id: number;
  status: ItemStatusType;
  context?: any;
}

enum ItemStatusType {
  Processing,
  Done
}

const DELAY = 2000;
const LIMIT_QUERY = 2;

const CONTEXT = [
  {name: 'Max'},
  {name: 'Vlad'},
  {name: 'Vova'}
]

// todo: generate from context
function create(context: any[]): Observable<Item[]> {
  let ids = 0;
  return of(
    context.map(ctx => ({
      id: ids++,
      status: getRandomStatus(),
      context: ctx
    }))
  );
}

function get(ids: number[]): Observable<Item[]> {
  return of(
    ids.map(item => ({
      id: item,
      status: getRandomStatus()
    }))
  );
}

function getRandomStatus() {
  return Math.round(Math.random())
    ? ItemStatusType.Processing
    : ItemStatusType.Done;
}

// todo: read about
// switch map
// concat map
// flat/merge map
function init() {
  create(CONTEXT).pipe(

    concatMap(items => 
      of(items)
      .pipe(
        delay(DELAY),
        takeWhile(() => items.length !== 0 ),
        concatMap(_ => {
          let idsProcessing: number[];
          idsProcessing = items.map(item => item.id);
          return get(idsProcessing).pipe(
              tap(item => {
              console.log('item in get', item)
              items = item.filter(elem => elem.status === 0);
            })
          )
        }),
        repeat(LIMIT_QUERY),
        finalize(() => console.log("should stop", items))
      )
    ),
  ).subscribe();
}

init();
