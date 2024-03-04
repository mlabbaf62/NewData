using System;

namespace dtoDBUGP
{
    public partial class WorkFlowArchive
    {
        public int NidFile { get; set; }
    }
    public partial class LogVisitor
    {
        public int MonthNum { get; set; }
        public string Month { get; set; }

        public string Time { get; set; }

        public string TimeRange { get; set; }

        public string MinDate { get; set; }
        public string MaxDate { get; set; }

        public int count { get; set; }

        public string Year { get; set; }
    }

    public partial class LogState
    {
        public short MaxState { get; set; }
    }
    public partial class Request_Info
    {
        public string MainRequesterName { get; set; }

        public byte CI_Requester { get; set; }

        public bool IsHaveRequest { get; set; }
        public string BuyerCellphone { get; set; }
        public string BuyerNationalCode { get; set; }
        
        public string Buyer { get; set; }
        public string Dong { get; set; }
        //G5r1
        public string RequestDetails { get; set; }
        public Guid NidNosaziCode { get; set; }

        public byte CI_ShahrsazRequestType { get; set; }

        public string MandateDate{ get; set; }
        public string MandateNo { get; set; }

        
    }
}

