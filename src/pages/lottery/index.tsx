import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";

export default function LotteryPage() {
    const [lottery] = useSearchParam(SEARCH_PARAMS.LOTTERY)
    


    return <>
    {lottery}

    </>;
  }
  