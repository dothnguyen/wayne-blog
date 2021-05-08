import { ValidatorFn } from '@angular/forms';

  /**
   * A conditional validator generator. Assigns a validator to the form control if the predicate function returns true on the moment of validation
   * @example
   * Here if the myCheckbox is set to true, the myEmailField will be required and also the text will have to have the word 'mason' in the end.
   * If it doesn't satisfy these requirements, the errors will placed to the dedicated `illuminatiError` namespace.
   * Also the myEmailField will always have `maxLength`, `minLength` and `pattern` validators.
   * ngOnInit() {
   *   this.myForm = this.fb.group({
   *    myCheckbox: [''],
   *    myEmailField: ['', [
   *       Validators.maxLength(250),
   *       Validators.minLength(5),
   *       Validators.pattern(/.+@.+\..+/),
   *       conditionalValidator(() => this.myForm.get('myCheckbox').value,
   *                            Validators.compose([
   *                            Validators.required,
   *                            Validators.pattern(/.*mason/)
   *         ]),
   *        'illuminatiError')
   *        ]]
   *     })
   * }
   * @param predicate
   * @param validator
   * @param errorNamespace optional argument that creates own namespace for the validation error
   */
  export function conditionalValidator(
    predicate: () => boolean,
    validator: ValidatorFn,
    errorNamespace?: string
  ): ValidatorFn {
    return formControl => {
      if (!formControl.parent) {
        return null;
      }
      let error = null;
      if (predicate()) {
        error = validator(formControl);
      }
      if (errorNamespace && error) {
        const customError = {};
        customError[errorNamespace] = error;
        error = customError;
      }
      return error;
    };
  }


 export function calculatePages(noOfPage: number, curPage: number) {
    var pages = []

    if (noOfPage <= 5) {
      pages = [...Array(noOfPage)].map((item, idx) => 1 + idx);
    } else {
      if (curPage <= 3) {
        pages = [...Array(4)].map((item, idx) => 1 + idx);
        pages.push(-1);
        pages.push(noOfPage);

      } else if (curPage > noOfPage - 3) {
        pages.push(1);
        pages.push(-1);
        pages = pages.concat([...Array(4)].map((item, idx) => noOfPage - 4 + 1 + idx));
      } else {
        pages.push(1);
        pages.push(-1);

        pages.push(curPage - 1);
        pages.push(curPage);
        pages.push(curPage + 1);

        pages.push(-1);
        pages.push(noOfPage);
      }
    }
    return pages;
  }