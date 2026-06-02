import { Injectable } from '@nestjs/common';
import { DecisionInteractor } from '../use-cases/decision.interactor';
import { AuthorizeDecisionInputDTO } from '../dto/authorize-decision-input.dto';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';

@Injectable()
export class DecisionService {
  constructor(private readonly decisionInteractor: DecisionInteractor) {}

  public async authorizeDecision(data: AuthorizeDecisionInputDTO): Promise<TransactionDTO> {
    const result = await this.decisionInteractor.authorizeDecision(data);
    return result as TransactionDTO;
  }
}
