import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function qbDateInterval<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  datePropertyName: string,
  minDate?: Date,
  maxDate?: Date,
) {
  if (minDate) {
    qb.andWhere(`${datePropertyName} >= :minDate`, { minDate });
  }

  if (maxDate) {
    qb.andWhere(`${datePropertyName} <= :maxDate`, { maxDate });
  }

  return qb;
}

