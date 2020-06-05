import { of, timer, Observable, from, throwError } from "rxjs";
import {
  map,
  takeWhile,
  tap,
  finalize,
  delay,
  repeat,
} from "rxjs/operators";

interface Item {
  id: number;
  status: ItemStatusType;
  context: any[];
}

enum ItemStatusType {
  Processing = "Processing",
  Done = "Done"
}

const DELAY = 2000;
const LIMIT_QUERY = 5;

function create(context: any[]): Observable<Item[]> {
  const minNubmerElements = 1;
  const maxNubmerElements = 5;

  let randomItemsElements: number = Math.round(
    minNubmerElements + Math.random() * maxNubmerElements
  );

  return of(
    Array.from(new Array(randomItemsElements), () => {
      return {
        id: randomItemsElements--,
        status: getRandomStatus(),
        context: context
      };
    })
  );
}

function get(ids: number[]): Observable<Item[]> {
  return of(ids.map(item => ({
    id: item,
    status: ItemStatusType.Processing,
    context: null
  }))
  ).pipe(
    map(item => processingRequest(item))
  );
}

function isItemStatusDone(element: Item, index: number, array: Item[]): boolean {
  return element.status !== ItemStatusType.Processing;
}

function processingRequest(items): Item[] {
  return items.map(item => ({
      id: item.id,
      status: getRandomStatus(),
      context: null
  }));
}

function getRandomStatus() {
  return Math.round(Math.random()) ? ItemStatusType.Processing: ItemStatusType.Done
}

function init() {
  create([]).subscribe(items => {
    let result: Item[] = items.concat();
    let tempItems: Item[] = items.filter(
      item => item.status !== ItemStatusType.Done
    );

    let idsProcessing: number[];
    const poll$ = of(tempItems).pipe(delay(DELAY));
    console.log('item after create', tempItems);

    poll$.pipe(
      takeWhile((item) => item.every(isItemStatusDone) !== true),
      tap(() => {
        idsProcessing = tempItems.map(item => item.id);
        
        get(idsProcessing).pipe(
          tap(item => {

            item.filter(
              elem => elem.status === ItemStatusType.Done
            ).forEach(elemDone => {
              result.map( elemResult => 
                elemResult.id === elemDone.id ? elemResult.status = elemDone.status: elemResult);
            });

            tempItems = item.filter(elem => elem.status === ItemStatusType.Processing);

            console.log('item after get', result);
          })
        ).subscribe()

      }),
      repeat(LIMIT_QUERY),
      finalize(() => console.log("should stop"))
    ).subscribe();
  });
}

init();
