export function getNextFileAfterAnswer(fileNumber, totalSteps) {
  if (
    !Number.isInteger(fileNumber) ||
    !Number.isInteger(totalSteps) ||
    fileNumber < 1 ||
    totalSteps < 1 ||
    fileNumber > totalSteps
  ) {
    return fileNumber
  }

  return fileNumber < totalSteps ? fileNumber + 1 : fileNumber
}
