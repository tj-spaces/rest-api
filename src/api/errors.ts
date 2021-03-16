/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/
export class InvalidArgumentError extends Error {
  name = "InvalidArgumentError";
}
export class ResourceNotFoundError extends Error {
  name = "ResourceNotFoundError";
}
export class InvalidPermissionsError extends Error {
  name = "InvalidPermissionsError";
}
export class UnauthorizedError extends Error {
  name = "UnauthorizedError";
}
export class NoopError extends Error {
  name = "NoopError";
}
export class WrongRelationTypeError extends Error {
  name = "WrongRelationTypeError";
}
export class InternalServerError extends Error {
  name = "InternalServerError";
}
