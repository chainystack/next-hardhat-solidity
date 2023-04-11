import React, { useEffect } from "react";
//mui
import { Box, Grid, Container, Typography, Button, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
// import CircularProgress from "@mui/material/CircularProgress";
import { Image } from "../../components";
import { getUserCookie } from "../../utils/getCookies";

import {
  DropDownMarks,
  DropDownPrice,
  DropDownMain,
} from "../../components/shared";
import { queryParamFormatter } from "../../utils/queryStringFormetter";

// common

import {
  CardHeadingGradient,
  TrandingNft,
  CardHeading,
} from "../../components/shared";
import { AdminNft } from "src/components/nft";
// routes
import Routes from "src/routes";
import { GetNftsList } from "../../apis";
import { useAppContext } from "../../context-api/appContext";
import { converter } from "../../utils/ethConverter";

function NftsList() {
  const token = getUserCookie();
  const [adminToken, setAdminToken] = React.useState("");
  const [nftData, setNftData] = React.useState([]);
  const { dispatch, state } = useAppContext();
  const [skip, setSkip] = React.useState(0);
  const [btnLabel, setBtnLabel] = React.useState("Load More");
  const [payloadData, setPayloadData] = React.useState({
    skip: 0,
    limit: "12",
  });

  useEffect(() => {
    if (token) {
      setAdminToken(token);
    }
  }, [token]);

  const [trendingFilter, setTrendingFilter] = React.useState(false);
  const [categories, setCategories] = React.useState(null);
  React.useEffect(() => {
    if (state?.categories.length > 0) {
      let result = state?.categories.map((a) => a.category_name);
      let sortedResult = result.sort();
      setCategories(sortedResult);
    }
  }, [state?.categories]);
  React.useEffect(() => {
    setPayloadData({ ...payloadData });
  }, []);

  const getAllNftsData = async () => {
    const payload = {
      //  views: "desc",
      skip: 0,
      limit: "12",
    };
    setPayloadData(payload);
    if (state.appyFilter.length > 0) {
      Object.assign(payloadData, {
        category: JSON.stringify(state.appyFilter),
      });
    }

    if (state.priceFilter.min > 0 && state.priceFilter.max > 0) {
      let convertedPrice = {
        min: parseInt(converter(state.priceFilter.min, "eth", "wei")),
        max: parseInt(converter(state.priceFilter.max, "eth", "wei")),
      };

      Object.assign(payloadData, { range: JSON.stringify(convertedPrice) });
    }

    const result = await GetNftsList(queryParamFormatter(payloadData));

    console.log("result..", result);

    if (result?.data?.data) {
      if (result?.data?.is_success === false) {
        dispatch({ type: "PROFILE_NFTS", value: [] });
        return;
      }
      dispatch({ type: "PROFILE_NFTS", value: result?.data?.data });
      setBtnLabel("Load More");
    }
    if (result?.data?.data.length === 0) {
      setBtnLabel("No More Data ...");
      return;
    }
  };

  const handleTrending = async () => {
    const payload = {
      likes: "desc",
      views: "desc",
      skip: "0",
      limit: "16",
    };
    setPayloadData(payload);

    const result = await GetNftsList(queryParamFormatter(payloadData));

    if (result?.data?.data) {
      dispatch({ type: "PROFILE_NFTS", value: result?.data?.data });
      setBtnLabel("Load More");
    }
  };

  const handleMore = async () => {
    Object.assign(payloadData, { skip: skip + 12 });

    const result = await GetNftsList(queryParamFormatter(payloadData));

    if (result?.data?.data) {
      let oldArray = state.profileNfts;
      let newArray = result?.data?.data;
      let finalArray = [...oldArray, ...newArray];
      dispatch({ type: "PROFILE_NFTS", value: finalArray });
      if (result?.data?.data.length === 0) {
        setBtnLabel("No More Data ...");
        return;
      }
      setSkip(skip + 12);
    }
  };

  React.useEffect(async () => {
    setSkip(0);
    getAllNftsData();
  }, [state.priceFilter]);

  React.useEffect(async () => {
    setSkip(0);
    getAllNftsData();
  }, [state.appyFilter]);

  const theme = useTheme();

  return (
    <Container
      maxWidth={false}
      sx={{
        boxShadow: (theme) => ({
          xs: 0,
        }),
        maxWidth: "1300px",
        pt: "60px",
      }}
    >
      <Box
        sx={{
          width: "auto",
          height: "auto",
          justifyContent: "space-between",
          display: "flex",
          overflow: "hidden",
          alignItems: "center",
        }}
      >
        <CardHeading text="NFT Listings" />
      </Box>

      <Box maxWidth="500px" pt="12px" pb="12px">
        <Typography variant="h3Lightest">
          See all the details related to your nfts and keep track of them. You
          can view all the nfts listed on your marketplace.
        </Typography>
      </Box>

      <Grid container mt={2} mb={6}>
        <Grid item xs={12} sm={8}>
          <Grid container spacing={2}>
            <Grid item>
              <TrandingNft
                onClick={() => {
                  handleTrending();
                  dispatch({ type: "TRENDING_FILTER", value: true });

                  dispatch({ type: "PROFILE_NFTS", value: [] });
                  dispatch({
                    type: "PRICE_FILTER",
                    value: { min: 0, max: 0 },
                  });
                }}
                isIcon={true}
                src="/assets/images/svgs/top.svg"
                text="Trending NFTs"
              />
            </Grid>
            <Grid item>
              <DropDownMarks
                isIcon={true}
                src="/assets/images/svgs/select.svg"
                text="Select Category"
                data={categories}
              />
            </Grid>
            <Grid item>
              <DropDownPrice
                isIcon={true}
                src="/assets/images/svgs/dollar.svg"
                text="Price"
              />
            </Grid>

            <Grid item>
              <Box
                className=""
                sx={{ pb: { xs: 2, md: 0 }, ml: { xs: 0, md: 0 } }}
              >
                <Button
                  onClick={() => {
                    dispatch({ type: "CLEAR_ALL", value: true });
                    dispatch({ type: "SALE_FILTER", value: [] });
                    dispatch({ type: "APPLY_FILTER", value: [] });
                    dispatch({ type: "TRENDING_FILTER", value: false });
                    dispatch({
                      type: "PRICE_FILTER",
                      value: { min: 0, max: 0 },
                    });
                  }}
                  variant="containedInherit"
                  target="_blank"
                  sx={{
                    minHeight: 46.2,
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sm={4}
          display="flex"
          justifyContent={{ md: "flex-end", sm: "flex-start" }}
          paddingTop={{ xs: "15px", sm: "0px" }}
        ></Grid>
      </Grid>

      <Grid container spacing={1} mt={2}>
        {state?.profileNfts &&
        state?.profileNfts.length > 0 &&
        state?.trendingFilter === false ? (
          state?.profileNfts?.map((value, index) => {
            let nftLikes = value?.likes;
            let owner = value?.nft_owners[value?.nft_owners.length - 1];

            return (
              <Grid item xs={12} md={3} key={index}>
                <AdminNft
                  nftId={value?._id}
                  linkKey={value?._id}
                  src={
                    process.env.NEXT_PUBLIC_PINATA_BASE_URL +
                    value?.profile_image
                  }
                  imageType={value?.image_type}
                  name={value?.nft_name}
                  price={owner?.nft_price}
                  likes={nftLikes}
                  isEnabled={value?.isEnabled}
                />
              </Grid>
            );
          })
        ) : state?.profileNfts.length > 0 && state?.trendingFilter === true ? (
          state?.profileNfts?.slice(0, 16).map((value, index) => {
            let activity = value?.activities;
            let nftLikes = value?.likes;

            return (
              <Grid item xs={12} md={3} key={index}>
                <AdminNft
                  nftId={value?._id}
                  linkKey={value?._id}
                  src={
                    process.env.NEXT_PUBLIC_PINATA_BASE_URL +
                    value?.profile_image
                  }
                  imageType={value?.image_type}
                  name={value?.nft_name}
                  price={activity?.nft_price}
                  likes={nftLikes}
                  value={value}
                />
              </Grid>
            );
          })
        ) : (
          <Box display="flex" justifyContent="center" width="100%">
            <Image
              alt="cover"
              src="/assets/images/svgs/noData.svg"
              sx={{
                width: "270px",
                height: "auto",
                mt: 6,
              }}
            />
          </Box>
        )}
      </Grid>

      {state?.profileNfts.length > 0 && state?.trendingFilter === false ? (
        <Box
          py={1}
          mt={10}
          display="flex"
          textAlign={"center"}
          justifyContent="center"
        >
          <Typography
            variant="h4"
            sx={{ color: theme.palette.brandpurple.primary }}
          >
            {btnLabel !== "Load More" ||
            state.profileNfts.length < 12 ? null : (
              <Link
                onClick={handleMore}
                underline="always"
                color="inherit"
                sx={{ color: theme.palette.brandpurple.primary }}
              >
                {btnLabel}
              </Link>
            )}
          </Typography>
        </Box>
      ) : null}
    </Container>
  );
}

export default NftsList;
