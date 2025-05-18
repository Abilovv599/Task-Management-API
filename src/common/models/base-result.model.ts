export abstract class BaseResult {
  isSuccess: boolean;

  protected constructor(isSuccess: boolean) {
    this.isSuccess = isSuccess;
  }
}
