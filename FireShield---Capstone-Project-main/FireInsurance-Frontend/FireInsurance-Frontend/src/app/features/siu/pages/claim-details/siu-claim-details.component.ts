import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SiuService, SiuClaimDetails, SiuInvestigationActionResponse } from '../../services/siu.service';
import { DocumentService } from '../../../../core/services/document.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-siu-claim-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './siu-claim-details.component.html'
})
export class SiuClaimDetailsComponent implements OnInit {
  private readonly siuService = inject(SiuService);
  private readonly documentService = inject(DocumentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Component state
  claimDetails = signal<SiuClaimDetails | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  claimId = signal('');

  // Analysis state
  isAnalyzing = signal(false);
  aiReasoning = signal<string | null>(null);
  auditLogs = signal<any[]>([]);
  documents = signal<any[]>([]);

  // Investigation action loading states
  isStartingInvestigation = signal(false);
  isMarkingFraud = signal(false);
  isClearingClaim = signal(false);
  isLoadingLogs = signal(false);
  actionMessage = signal('');
  actionSuccess = signal<boolean | null>(null);

  // Computed properties
  fraudSeverityLevel = computed(() => {
    const claim = this.claimDetails();
    if (!claim || typeof claim.fraudScore !== 'number') return 'unknown';

    if (claim.fraudScore >= 80) return 'high';
    if (claim.fraudScore >= 50) return 'medium';
    return 'low';
  });

  suspiciousIndicators = computed(() => {
    const claim = this.claimDetails();
    if (!claim || typeof claim.fraudScore !== 'number') return ['Backend data unavailable'];

    const indicators: string[] = [];

    // Generate suspicious indicators based on claim data
    if (claim.fraudScore >= 80) {
      indicators.push('High fraud score detected');
    }

    if (claim.claimAmount && claim.claimAmount > 500000) {
      indicators.push('High claim amount');
    }

    if (claim.claimAmount && claim.policy?.maxCoverageAmount && claim.claimAmount > claim.policy.maxCoverageAmount) {
      indicators.push('Claim exceeds policy coverage');
    }

    if (claim.settlementAmount === 0 && claim.status === 'REJECTED') {
      indicators.push('Previously rejected claim');
    }

    if (!claim.firNumber && claim.causeOfFire?.toLowerCase().includes('fire')) {
      indicators.push('Missing FIR number for fire incident');
    }

    return indicators.length > 0 ? indicators : ['Routine investigation'];
  });

  customerDisplayName = computed(() => {
    const claim = this.claimDetails();
    if (!claim?.customer) return 'Unknown Customer';

    return `${claim.customer.firstName || ''} ${claim.customer.lastName || ''}`.trim() ||
           claim.customer.email ||
           'Unknown Customer';
  });

  // Investigation action validation computed properties
  canStartInvestigation = computed(() => {
    const claim = this.claimDetails();
    if (!claim || !claim.status) return false;

    // Can start investigation if claim is submitted, or in a generic triage state
    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'SURVEY_COMPLETED', 'SURVEY_ASSIGNED', 'PENDING_REVIEW'];
    return (validStatuses.includes(claim.status.toUpperCase()) || !claim.status.startsWith('SIU_')) &&
           !this.isStartingInvestigation() &&
           !this.isPerformingAnyAction();
  });

  canMarkAsFraud = computed(() => {
    const claim = this.claimDetails();
    if (!claim || !claim.status) return false;
 
    // Actionable statuses for confirming fraud
    const validStatuses = ['SIU_UNDER_REVIEW', 'UNDER_REVIEW', 'SUBMITTED', 'SURVEY_COMPLETED', 'SURVEY_ASSIGNED', 'PENDING_REVIEW'];
    return validStatuses.includes(claim.status.toUpperCase()) &&
           !this.isMarkingFraud() &&
           !this.isPerformingAnyAction();
  });

  canClearClaim = computed(() => {
    const claim = this.claimDetails();
    if (!claim || !claim.status) return false;
 
    // Actionable statuses for clearing claims
    const validStatuses = ['SIU_UNDER_REVIEW', 'UNDER_REVIEW', 'SUBMITTED', 'SURVEY_COMPLETED', 'SURVEY_ASSIGNED', 'PENDING_REVIEW'];
    return validStatuses.includes(claim.status.toUpperCase()) &&
           !this.isClearingClaim() &&
           !this.isPerformingAnyAction();
  });

  isPerformingAnyAction = computed(() => {
    return this.isStartingInvestigation() || this.isMarkingFraud() || this.isClearingClaim() || this.isAnalyzing();
  });

  investigationStatusMessage = computed(() => {
    const claim = this.claimDetails();
    if (!claim || !claim.status) return 'Claim data not available';

    switch (claim.status.toUpperCase()) {
      case 'SUBMITTED':
        return 'Claim submitted - Ready for investigation';
      case 'UNDER_REVIEW':
        return 'Investigation in progress';
      case 'SURVEY_ASSIGNED':
        return 'Survey assigned - Investigation pending';
      case 'SURVEY_COMPLETED':
        return 'Survey completed - Ready for SIU decision';
      case 'APPROVED':
        return 'Claim approved - Investigation closed';
      case 'REJECTED':
        return 'Claim rejected - Investigation closed';
      case 'PAID':
        return 'Claim settled - Investigation completed';
      default:
        return 'Status unknown';
    }
  });

  ngOnInit(): void {
    // Get claim ID from route parameters
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.claimId.set(claimId);
      this.loadClaimDetails(claimId);
      this.loadDocuments(claimId);
      this.loadAuditLogs(claimId);
    } else {
      this.errorMessage.set('No claim ID provided in route');
      this.isLoading.set(false);
    }
  }

  /**
   * Load claim details from backend API
   */
  private loadClaimDetails(claimId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.siuService.getClaimDetails(claimId).subscribe({
      next: (claimDetails: SiuClaimDetails) => {
        // Check if backend returned placeholder response
        if ((claimDetails as any).message && (claimDetails as any).message.includes('Implementation pending')) {
          this.errorMessage.set('Backend claim details endpoint is not yet implemented.');
          this.claimDetails.set(null);
        } else {
          this.claimDetails.set(claimDetails);
        }
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading claim details:', error);
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load Audit Trail for the claim
   */
  loadAuditLogs(claimId: string): void {
    this.isLoadingLogs.set(true);
    this.siuService.getAuditLogs(claimId).subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.isLoadingLogs.set(false);
      },
      error: (err) => {
        console.error('Failed to load audit logs', err);
        this.isLoadingLogs.set(false);
      }
    });
  }

  /**
   * Load documents associated with this claim
   */
  private loadDocuments(claimId: string): void {
    this.documentService.getDocumentsForEntity(Number(claimId), 'CLAIM').subscribe({
      next: (docs) => this.documents.set(docs || []),
      error: (err) => console.error('Failed to load documents', err)
    });
  }

  /**
   * Executes the REAL AI Smart Scan via backend
   */
  runSmartScan(): void {
    const claimId = this.claimId();
    if (!claimId) return;

    this.isAnalyzing.set(true);
    this.aiReasoning.set(null);

    this.siuService.runSmartScan(claimId).subscribe({
      next: (response) => {
        this.aiReasoning.set(response.analysis);
        this.isAnalyzing.set(false);
        this.loadAuditLogs(claimId); // Refresh logs to show scan event
      },
      error: (error) => {
        console.error('Smart Scan failed:', error);
        this.isAnalyzing.set(false);
        this.aiReasoning.set('Failed to perform AI Smart Scan. Check server logs.');
      }
    });
  }

  /**
   * Navigate back to SIU dashboard
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navigate back to SIU dashboard (alternative method)
   */
  backToDashboard(): void {
    this.router.navigate(['/siu-dashboard/dashboard']);
  }

  /**
   * Get CSS class for fraud score display
   */
  getFraudScoreClass(score: number): string {
    if (score >= 80) return 'text-red-600 font-bold';
    if (score >= 50 && score < 80) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  }

  /**
   * Get CSS class for fraud severity level
   */
  getFraudSeverityClass(): string {
    const level = this.fraudSeverityLevel();
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get CSS class for claim state badge
   */
  getStateBadgeClass(state: string): string {
    switch (state?.toUpperCase()) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'SURVEY_ASSIGNED':
      case 'SURVEY_COMPLETED':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date values
   */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Update claim investigation status
   */
  updateClaimStatus(newStatus: string): void {
    const claimId = this.claimId();
    if (!claimId) return;

    this.siuService.updateClaimStatus(claimId, newStatus).subscribe({
      next: () => {
        this.loadClaimDetails(claimId);
        this.loadAuditLogs(claimId);
      },
      error: (error) => {
        console.error('Error updating claim status:', error);
        this.errorMessage.set('Failed to update claim status.');
      }
    });
  }

  // === Investigation Action Methods ===

  /**
   * Start formal SIU investigation
   */
  startInvestigation(): void {
    const claimId = this.claimId();
    if (!claimId || !this.canStartInvestigation()) return;

    this.clearActionMessages();
    this.isStartingInvestigation.set(true);

    this.siuService.startInvestigation(claimId, 'Formal SIU investigation initiated').subscribe({
      next: (response: SiuInvestigationActionResponse) => {
        this.handleActionSuccess(response, 'Investigation started successfully');
        this.loadClaimDetails(claimId);
        this.loadAuditLogs(claimId);
      },
      error: (error: HttpErrorResponse) => {
        this.handleActionError('Failed to start investigation', error);
      },
      complete: () => {
        this.isStartingInvestigation.set(false);
      }
    });
  }

  /**
   * Mark claim as fraudulent
   */
  markAsFraud(): void {
    const claimId = this.claimId();
    if (!claimId || !this.canMarkAsFraud()) return;

    const claim = this.claimDetails();
    const reason = `Fraudulent claim confirmed. Fraud score: ${claim?.fraudScore}%.`;

    this.clearActionMessages();
    this.isMarkingFraud.set(true);

    this.siuService.markAsFraud(claimId, reason).subscribe({
      next: (response: SiuInvestigationActionResponse) => {
        this.handleActionSuccess(response, 'Claim successfully marked as fraudulent');
        this.loadClaimDetails(claimId);
        this.loadAuditLogs(claimId);
      },
      error: (error: HttpErrorResponse) => {
        this.handleActionError('Failed to mark claim as fraudulent', error);
      },
      complete: () => {
        this.isMarkingFraud.set(false);
      }
    });
  }

  /**
   * Clear claim as legitimate
   */
  clearClaim(): void {
    const claimId = this.claimId();
    if (!claimId || !this.canClearClaim()) return;

    const notes = 'Claim cleared as legitimate after SIU investigation.';

    this.clearActionMessages();
    this.isClearingClaim.set(true);

    this.siuService.clearClaim(claimId, notes).subscribe({
      next: (response: SiuInvestigationActionResponse) => {
        this.handleActionSuccess(response, 'Claim successfully cleared as legitimate');
        this.loadClaimDetails(claimId);
        this.loadAuditLogs(claimId);
      },
      error: (error: HttpErrorResponse) => {
        this.handleActionError('Failed to clear claim', error);
      },
      complete: () => {
        this.isClearingClaim.set(false);
      }
    });
  }

  /**
   * Handle successful investigation actions
   */
  private handleActionSuccess(response: SiuInvestigationActionResponse, userMessage: string): void {
    this.actionSuccess.set(true);
    this.actionMessage.set(userMessage);
    setTimeout(() => {
      this.clearActionMessages();
    }, 5000);
  }

  /**
   * Handle investigation action errors
   */
  private handleActionError(userMessage: string, error: HttpErrorResponse): void {
    this.actionSuccess.set(false);
    const errorDetail = error.error?.message || error.message || 'Unknown error occurred';
    this.actionMessage.set(`${userMessage}: ${errorDetail}`);
  }

  /**
   * Clear action messages and status
   */
  private clearActionMessages(): void {
    this.actionMessage.set('');
    this.actionSuccess.set(null);
  }

  /**
   * Get user-friendly error message
   */
  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Cannot connect to API server.';
    if (error.status === 403) return 'Access denied. SIU role required.';
    if (error.status === 404) return 'Claim not found.';
    return error.error?.message || error.message || 'Error occurred.';
  }

  /**
   * Retry loading
   */
  retryLoad(): void {
    const claimId = this.claimId();
    if (claimId) {
      this.loadClaimDetails(claimId);
      this.loadAuditLogs(claimId);
    }
  }
}