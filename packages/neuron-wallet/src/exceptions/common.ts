import i18n from '../utils/i18n'

export class NameIsInvalid extends Error {
  constructor(field: string) {
    super(i18n.t('messages.name-is-invalid', { field }))
  }
}

export class NameIsUsed extends Error {
  constructor(field: string) {
    super(i18n.t('messages.name-is-used', { field }))
  }
}
export class IsRequired extends Error {
  constructor(field: string) {
    super(i18n.t('messages.is-required', { field }))
  }
}

export class MissingRequiredArgument extends Error {
  constructor() {
    super(i18n.t('messages.missing-required-argument'))
  }
}

export class ServiceHasNotResponse extends Error {
  constructor(serviceName: string) {
    super(`${serviceName} service has no response`)
  }
}
export class InvalidFormat extends Error {
  constructor(field: string) {
    super(i18n.t('messages.invalid-format', { field }))
  }
}

export class ShouldBeTypeOf extends Error {
  constructor(field: string, type: string) {
    super(i18n.t('should-be-type-of', { field, type }))
  }
}

export default {
  NameIsInvalid,
  NameIsUsed,
  IsRequired,
  MissingRequiredArgument,
  ServiceHasNotResponse,
  ShouldBeTypeOf,
}
